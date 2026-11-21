import { test, expect } from "@playwright/test";
import { elementPrerenderAttributes } from "../../src/ssr/prerender-manifest.js";
import { template as productCardTemplate } from "../fixtures/browser/product-card-template.mjs";
import { type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createStaticRepositoryServer } from "../support/create-static-repository-server.js";

const repositoryRoot = process.cwd();
const defaultBrowserFixturePath =
  "tests/fixtures/browser/browser-ready-smoke.html";

test.describe("Browser-ready distribution", () => {
  let server: Server | undefined;
  let baseUrl: string;

  test.beforeAll(async () => {
    // Arrange
    server = createStaticRepositoryServer(
      repositoryRoot,
      defaultBrowserFixturePath,
    );

    // Act
    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  test.afterAll(async () => {
    if (!server) return;
    // Act
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  test("should import the published browser-ready artifact from plain HTML", async ({
    page,
  }) => {
    // Arrange
    const smokeUrl = `${baseUrl}/tests/fixtures/browser/browser-ready-smoke.html`;

    // Act
    await page.goto(smokeUrl);

    // Assert
    await expect(page.locator("#status")).toHaveText("ready");
  });

  test("should project Pick component children through native named and default slots", async ({
    page,
  }) => {
    // Arrange
    const slotUrl = `${baseUrl}/tests/fixtures/browser/slot-projection.html`;

    // Act
    await page.goto(slotUrl);

    // Assert
    await expect(page.locator("#status")).toHaveText("ready");

    const projection = await page.evaluate(() => {
      const shell = document.querySelector("pick-slot-shell");
      const headerSlot = shell?.shadowRoot?.querySelector(
        'slot[name="header"]',
      ) as HTMLSlotElement | null;
      const defaultSlot = shell?.shadowRoot?.querySelector(
        "slot:not([name])",
      ) as HTMLSlotElement | null;
      const headerChild = headerSlot?.assignedElements()[0] as HTMLElement;
      const bodyChild = defaultSlot?.assignedElements()[0] as HTMLElement;

      return {
        shellHasShadowRoot: Boolean(shell?.shadowRoot),
        headerAssignedTag: headerChild?.tagName.toLowerCase() ?? null,
        headerAssignedSlot: headerChild?.getAttribute("slot") ?? null,
        headerText:
          headerChild?.shadowRoot?.querySelector("#title-output")
            ?.textContent ?? null,
        bodyAssignedTag: bodyChild?.tagName.toLowerCase() ?? null,
        bodyAssignedSlot: bodyChild?.getAttribute("slot") ?? null,
        bodyText:
          bodyChild?.shadowRoot?.querySelector("#body-output")?.textContent ??
          null,
      };
    });

    expect(projection).toEqual({
      shellHasShadowRoot: true,
      headerAssignedTag: "pick-slot-title",
      headerAssignedSlot: "header",
      headerText: "Projected Header",
      bodyAssignedTag: "pick-slot-body",
      bodyAssignedSlot: null,
      bodyText: "Projected Body",
    });
  });

  test("should upgrade independent widgets in place when their module loads after HTML", async ({
    page,
  }) => {
    // Arrange
    const markers = Object.entries(
      elementPrerenderAttributes("pick-product-card", productCardTemplate),
    )
      .map(([name, value]) => `${name}="${value}"`)
      .join(" ");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/widgets.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `
      <main><pick-router>Outside</pick-router>
      <pick-product-card data-case="valid" product-id="123" ${markers}><article><span>Server product</span><button type="button">0</button></article></pick-product-card>
      <pick-product-card data-case="stale" id="second-widget" class="theme" data-theme="widget-local" product-id="234" ${markers.replace(/fnv1a-[a-f0-9]+/, "obsolete")}><article>Stale</article></pick-product-card>
      <pick-product-card data-case="mismatch" product-id="345" ${markers}><aside>Old structure</aside></pick-product-card>
      <pick-product-card data-case="empty" product-id="456" ${markers}></pick-product-card>
      <table><tbody></tbody></table></main>`,
      }),
    );
    await page.goto(baseUrl + "/widgets.html");
    const widget = page.locator('[data-case="valid"]');
    const serverRoot = await widget.locator("article").elementHandle();
    await expect(widget).toHaveText("Server product0");

    // Act
    await page.addScriptTag({
      type: "module",
      url: baseUrl + "/tests/fixtures/browser/product-card.mjs",
    });
    await widget.getByRole("button").click();

    // Assert
    await expect(widget.getByRole("button")).toHaveText("1");
    expect(
      await serverRoot!.evaluate(
        (node) =>
          node.getRootNode() ===
          document.querySelector('[data-case="valid"]')?.shadowRoot,
      ),
    ).toBe(true);
    await expect(widget.locator("span")).toHaveText("123");
    for (const [label, id] of [
      ["stale", "234"],
      ["mismatch", "345"],
      ["empty", "456"],
    ]) {
      const other = page.locator(`[data-case="${label}"]`);
      await expect(other.locator("span")).toHaveText(id);
      await expect(other.getByRole("button")).toHaveText("0");
    }
    expect(
      await page
        .locator("#second-widget")
        .evaluate((host) => [
          host.children.length,
          host.className,
          host.getAttribute("data-theme"),
        ]),
    ).toEqual([0, "theme", "widget-local"]);
    await widget.evaluate((host) => host.setAttribute("product-id", "789"));
    await expect(widget.locator("span")).toHaveText("789");
    await expect(page.locator("pick-router")).toHaveText("Outside");
    expect(
      await page.evaluate(async () => {
        const entry = "/dist/bootstrap.js";
        const { Services, bootstrapElement } = await import(entry);
        const isolated =
          !Services.has("IRenderEngine") && !customElements.get("pick-router");
        let collision = "";
        try {
          await bootstrapElement("pick-product-card", () => {});
        } catch (error) {
          collision = (error as Error).message;
        }
        return { isolated, collision };
      }),
    ).toEqual({
      isolated: true,
      collision: "Custom element 'pick-product-card' is already defined",
    });
    const parent = page.locator("tbody");
    await parent.evaluate((el) =>
      el.append(document.createElement("pick-product-card")),
    );
    await expect(
      parent.locator("pick-product-card").getByRole("button"),
    ).toHaveText("0");
    expect(
      await parent.evaluate((el) =>
        [...el.childNodes].map((node) => node.nodeName),
      ),
    ).toEqual(["PICK-PRODUCT-CARD"]);
    await page.evaluate(async () => {
      document.querySelector("pick-router")!.remove();
      const entry = "/dist/bootstrap.js";
      const { Services, bootstrapFramework } = await import(entry);
      await bootstrapFramework(Services);
    });
    await widget.getByRole("button").click();
    await expect(widget.getByRole("button")).toHaveText("2");
    expect(errors).toEqual([]);
  });

  test("should release a pending mount before reconnecting a widget", async ({
    page,
  }) => {
    // Arrange
    await page.route("**/reconnect.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<async-widget></async-widget>",
      }),
    );
    await page.goto(baseUrl + "/reconnect.html");

    // Act
    const counts = await page.evaluate(async () => {
      const path = "/dist/bootstrap.js";
      const { bootstrapElement } = (await import(
        path
      )) as typeof import("../../src/bootstrap.js");
      let begin!: () => void;
      let resume!: () => void;
      const started = new Promise<void>((resolve) => {
        begin = resolve;
      });
      const paused = new Promise<void>((resolve) => {
        resume = resolve;
      });
      let renders = 0;
      let completed!: () => void;
      const ready = new Promise<void>((resolve) => {
        completed = resolve;
      });
      let clicks = 0;
      let disposals = 0;
      let disposed!: () => void;
      const cleanedUp = new Promise<void>((resolve) => {
        disposed = resolve;
      });
      await bootstrapElement("async-widget", (ctx) => {
        ctx.initializer(async () => {
          begin();
          await paused;
        });
        ctx.html("<button>Press</button>");
        ctx.listen("click", () => {
          clicks++;
        });
        ctx.lifecycle({
          onInit() {
            if (++renders === 2) completed();
          },
          onDestroy() {
            if (++disposals === 2) disposed();
          },
        });
      });
      await started;
      const widget = document.querySelector("async-widget")!;
      widget.remove();
      document.body.append(widget);
      resume();
      await ready;
      const buttons = widget.shadowRoot!.querySelectorAll("button");
      buttons[0].click();
      widget.remove();
      await cleanedUp;
      buttons[0].click();
      return { clicks, disposals, buttons: buttons.length };
    });

    // Assert
    expect(counts).toEqual({ clicks: 1, disposals: 2, buttons: 1 });
  });
});
