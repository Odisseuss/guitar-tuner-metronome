#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = process.cwd();
const postcssPkgPath = path.join(
  projectRoot,
  "node_modules",
  "postcss-safe-parser",
  "node_modules",
  "postcss",
  "package.json"
);

if (!fs.existsSync(postcssPkgPath)) {
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(postcssPkgPath, "utf8"));

if (!pkg.exports || typeof pkg.exports !== "object") {
  process.exit(0);
}

let changed = false;
const requiredSubpaths = {
  "./lib/tokenize": "./lib/tokenize.js",
  "./lib/comment": "./lib/comment.js",
  "./lib/parser": "./lib/parser.js"
};

for (const [key, value] of Object.entries(requiredSubpaths)) {
  if (!pkg.exports[key]) {
    pkg.exports[key] = value;
    changed = true;
  }
}

if (changed) {
  fs.writeFileSync(postcssPkgPath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
  process.stdout.write("Patched postcss exports for postcss-safe-parser.\n");
}

function walk(dir, visitor) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, visitor);
      continue;
    }
    visitor(fullPath);
  }
}

const nodeModulesPath = path.join(projectRoot, "node_modules");

if (fs.existsSync(nodeModulesPath)) {
  const wasmReadPatchNeedle = 'if (typeof fetch === "function") {';
  const wasmReadPatchReplacement =
    'if (typeof fetch === "function" && !(typeof process === "object" && process.versions && process.versions.node)) {';

  walk(nodeModulesPath, filePath => {
    if (!filePath.endsWith(`${path.sep}source-map${path.sep}lib${path.sep}read-wasm.js`)) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf8");
    if (!content.includes(wasmReadPatchNeedle)) {
      return;
    }

    const next = content.replace(wasmReadPatchNeedle, wasmReadPatchReplacement);
    if (next !== content) {
      fs.writeFileSync(filePath, next, "utf8");
      process.stdout.write(`Patched source-map wasm loader: ${path.relative(projectRoot, filePath)}\n`);
    }
  });
}
