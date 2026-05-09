import { test, expect } from "@playwright/test";
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
    server = createStaticRepositoryServer(repositoryRoot, defaultBrowserFixturePath);

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
});
