#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const SOURCE_SKILL_DIR = path.join(
  projectRoot,
  ".github",
  "skills",
  "setup-pick-components",
);

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    target: process.cwd(),
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--target" || arg === "-t") {
      result.target = args[i + 1] ?? result.target;
      i += 1;
    }
  }

  return result;
}

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDirectory(sourceDir, targetDir) {
  ensureDirectory(targetDir);
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }

    fs.copyFileSync(sourcePath, targetPath);
  }
}

function ensureGitHubFolder(targetRoot) {
  const githubPath = path.join(targetRoot, ".github");
  ensureDirectory(githubPath);
  return githubPath;
}

function run() {
  if (!fs.existsSync(SOURCE_SKILL_DIR)) {
    console.error("Source skill directory not found:", SOURCE_SKILL_DIR);
    process.exit(1);
  }

  const { target } = parseArgs(process.argv);
  const targetRoot = path.resolve(target);

  if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
    console.error("Target path must be an existing directory:", targetRoot);
    process.exit(1);
  }

  const githubPath = ensureGitHubFolder(targetRoot);
  const targetSkillsDir = path.join(githubPath, "skills");
  const targetSkillDir = path.join(targetSkillsDir, "setup-pick-components");

  copyDirectory(SOURCE_SKILL_DIR, targetSkillDir);

  console.log("Export completed.");
  console.log("Copied skill to:", targetSkillDir);
  console.log("Next step: commit .github/skills/setup-pick-components/ in target repository.");
}

run();
