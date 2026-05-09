/**
 * Builds all compat examples from the repository root.
 * Prerequisite: npm run build:lib must have been run first.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

function run(label, cmd) {
  console.log(`\n▶ ${label}`);
  execSync(cmd, { cwd: root, stdio: "inherit" });
  console.log(`✅ ${label}`);
}

function requireArtifact(path) {
  if (!existsSync(resolve(root, path))) {
    console.error(`\n❌ Missing: ${path}`);
    console.error("   Run 'npm run build:lib' first.\n");
    process.exit(1);
  }
}

requireArtifact("dist/index.js");

run(
  "01 — tsc + legacy experimentalDecorators",
  "node_modules/.bin/tsc -p examples/compat/01-tsc-legacy/tsconfig.json",
);

run(
  "02 — webpack + ts-loader + TC39",
  "node_modules/.bin/webpack --config examples/compat/02-webpack-tc39/webpack.config.mjs",
);

run(
  "03 — swc + TC39",
  "node_modules/.bin/swc examples/compat/03-swc-tc39/src/main.ts" +
    " --out-file examples/compat/03-swc-tc39/dist/main.js" +
    " --config-file examples/compat/03-swc-tc39/.swcrc",
);

run(
  "04 — webpack + babel-loader + legacy decorators",
  "node_modules/.bin/webpack --config examples/compat/04-babel-legacy/webpack.config.mjs",
);

run(
  "05 — webpack + babel-loader + TC39 (2023-11)",
  "node_modules/.bin/webpack --config examples/compat/05-babel-tc39/webpack.config.mjs",
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
  );
} else {
  console.log("\n⚠️  06 — bun + TC39 skipped (bun runtime not installed)");
}

console.log("\n✅ All compat examples built.\n");
