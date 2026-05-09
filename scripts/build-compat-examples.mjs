/**
 * Builds all compat examples from the repository root.
 * Prerequisite: npm run build:prod must have been run first
 * (produces both dist/index.js and dist/browser/pick-components.js).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function run(label, cmd, ensureDir) {
  if (ensureDir) mkdirSync(resolve(root, ensureDir), { recursive: true });
  console.log(`\n▶ ${label}`);
  try {
    execSync(cmd, { cwd: root, stdio: "inherit" });
  } catch (error) {
    console.error(`\n❌ Build failed: ${label}`);
    process.exit(1);
  }
  console.log(`✅ ${label}`);
}

function requireArtifact(path) {
  if (!existsSync(resolve(root, path))) {
    console.error(`\n❌ Missing: ${path}`);
    console.error("   Run 'npm run build:prod' first.\n");
    process.exit(1);
  }
}

requireArtifact("dist/index.js");
requireArtifact("dist/browser/pick-components.js");

run(
  "01 — tsc + legacy experimentalDecorators",
  "npm exec -- tsc -p examples/compat/01-tsc-legacy/tsconfig.json",
);

run(
  "02 — webpack + ts-loader + TC39",
  "npm exec -- webpack --config examples/compat/02-webpack-tc39/webpack.config.mjs",
);

run(
  "03 — swc + TC39",
  "npm exec -- swc examples/compat/03-swc-tc39/src/main.ts" +
    " --out-file examples/compat/03-swc-tc39/dist/main.js" +
    " --config-file examples/compat/03-swc-tc39/.swcrc",
  "examples/compat/03-swc-tc39/dist",
);

run(
  "04 — webpack + babel-loader + legacy decorators",
  "npm exec -- webpack --config examples/compat/04-babel-legacy/webpack.config.mjs",
);

run(
  "05 — webpack + babel-loader + TC39 (2023-11)",
  "npm exec -- webpack --config examples/compat/05-babel-tc39/webpack.config.mjs",
);

let bunAvailable = false;
try {
  execSync("bun --version", { stdio: "pipe" });
  bunAvailable = true;
} catch {
  /* bun not installed */
}

if (bunAvailable) {
  run(
    "06 — bun + TC39",
    "bun build examples/compat/06-bun-tc39/src/main.ts" +
      " --outfile examples/compat/06-bun-tc39/dist/bundle.js" +
      " --target browser",
    "examples/compat/06-bun-tc39/dist",
  );
} else {
  console.log("\n⚠️  06 — bun + TC39 skipped (bun runtime not installed)");
}

console.log("\n✅ All compat examples built.\n");
