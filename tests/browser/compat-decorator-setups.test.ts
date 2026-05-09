import { test, expect } from "@playwright/test";
import { type Server } from "node:http";
import { existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import type { AddressInfo } from "node:net";
import { createStaticRepositoryServer } from "../support/create-static-repository-server.js";

const repositoryRoot = process.cwd();

function requireBuildArtifact(path: string): void {
  if (!existsSync(`${repositoryRoot}/${path}`)) {
    throw new Error(
      `Missing build artifact: ${path}\nRun 'npm run build:prod' before the compat tests.`,
    );
  }
}

function build(label: string, command: string): void {
  console.log(`\n  ▶ Building ${label}…`);
  try {
    execSync(command, { cwd: repositoryRoot, stdio: "pipe" });
  } catch (error) {
    const stderr = (error as NodeJS.ErrnoException & { stderr?: Buffer }).stderr?.toString() ?? "";
    const stdout = (error as NodeJS.ErrnoException & { stdout?: Buffer }).stdout?.toString() ?? "";
    throw new Error(`Build failed: ${label}\n${stdout}\n${stderr}`);
  }
}

function isBunAvailable(): boolean {
  try {
    execSync("bun --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

test.describe("Decorator compatibility setups", () => {
  let server: Server;
  let baseUrl: string;
  const bunAvailable = isBunAvailable();

  test.beforeAll(async ({ }, testInfo) => {
    // Allow time for all bundler/compiler builds on CI
    testInfo.setTimeout(180_000);

    // Arrange — verify prerequisites
    requireBuildArtifact("dist/index.js");
    requireBuildArtifact("dist/browser/pick-components.js");

    // Act — build all compat examples
    build(
      "01 — tsc + legacy experimentalDecorators",
      "npm exec -- tsc -p examples/compat/01-tsc-legacy/tsconfig.json",
    );

    build(
      "02 — webpack + ts-loader + TC39",
      "npm exec -- webpack --config examples/compat/02-webpack-tc39/webpack.config.mjs",
    );

    mkdirSync(`${repositoryRoot}/examples/compat/03-swc-tc39/dist`, {
      recursive: true,
    });
    build(
      "03 — swc + TC39",
      "npm exec -- swc examples/compat/03-swc-tc39/src/main.ts" +
        " --out-file examples/compat/03-swc-tc39/dist/main.js" +
        " --config-file examples/compat/03-swc-tc39/.swcrc",
    );

    build(
      "04 — webpack + babel-loader + legacy",
      "npm exec -- webpack --config examples/compat/04-babel-legacy/webpack.config.mjs",
    );

    build(
      "05 — webpack + babel-loader + TC39 (2023-11)",
      "npm exec -- webpack --config examples/compat/05-babel-tc39/webpack.config.mjs",
    );

    if (bunAvailable) {
      mkdirSync(`${repositoryRoot}/examples/compat/06-bun-tc39/dist`, {
        recursive: true,
      });
      build(
        "06 — bun + TC39",
        "bun build examples/compat/06-bun-tc39/src/main.ts" +
          " --outfile examples/compat/06-bun-tc39/dist/bundle.js" +
          " --target browser",
      );
    }

    // Act — start static file server
    server = createStaticRepositoryServer(
      repositoryRoot,
      "examples/compat/01-tsc-legacy/index.html",
    );
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
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test.describe("01 — tsc + legacy experimentalDecorators", () => {
    test("component renders", async ({ page }) => {
      // Arrange
      const url = `${baseUrl}/examples/compat/01-tsc-legacy/index.html`;

      // Act
      await page.goto(url);

      // Assert
      await expect(page.getByTestId("output")).toHaveText(
        "Hello Pick Components",
      );
    });
  });

  test.describe("02 — webpack + ts-loader + TC39 decorators", () => {
    test("component renders", async ({ page }) => {
      // Arrange
      const url = `${baseUrl}/examples/compat/02-webpack-tc39/index.html`;

      // Act
      await page.goto(url);

      // Assert
      await expect(page.getByTestId("output")).toHaveText(
        "Hello Pick Components",
      );
    });
  });

  test.describe("03 — swc + TC39 decorators", () => {
    test("component renders", async ({ page }) => {
      // Arrange
      const url = `${baseUrl}/examples/compat/03-swc-tc39/index.html`;

      // Act
      await page.goto(url);

      // Assert
      await expect(page.getByTestId("output")).toHaveText(
        "Hello Pick Components",
      );
    });
  });

  test.describe("04 — webpack + babel-loader + legacy decorators", () => {
    test("component renders", async ({ page }) => {
      // Arrange
      const url = `${baseUrl}/examples/compat/04-babel-legacy/index.html`;

      // Act
      await page.goto(url);

      // Assert
      await expect(page.getByTestId("output")).toHaveText(
        "Hello Pick Components",
      );
    });
  });

  test.describe("05 — webpack + babel-loader + TC39 decorators (2023-11)", () => {
    test("component renders", async ({ page }) => {
      // Arrange
      const url = `${baseUrl}/examples/compat/05-babel-tc39/index.html`;

      // Act
      await page.goto(url);

      // Assert
      await expect(page.getByTestId("output")).toHaveText(
        "Hello Pick Components",
      );
    });
  });

  test.describe("06 — bun + TC39 decorators", () => {
    test("component renders", async ({ page }) => {
      // Arrange
      if (!bunAvailable) {
        test.skip();
        return;
      }
      const url = `${baseUrl}/examples/compat/06-bun-tc39/index.html`;

      // Act
      await page.goto(url);

      // Assert
      await expect(page.getByTestId("output")).toHaveText(
        "Hello Pick Components",
      );
    });
  });
});
