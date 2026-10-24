const fs = require("node:fs");
const path = require("node:path");
const { version } = require("../package.json");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "src/ha-ubiquiti-dashboard.js");
const distPath = path.join(root, "dist/ha-ubiquiti-dashboard.js");
const source = fs.readFileSync(sourcePath, "utf8");
const versionPattern = /^const CARD_VERSION = "[^"]+";$/m;
if (!versionPattern.test(source)) throw new Error("CARD_VERSION declaration is missing.");
const output = source.replace(versionPattern, `const CARD_VERSION = "${version}";`);

// Release tags and the installed HACS resource must identify the same version.
if (process.env.GITHUB_REF_TYPE === "tag" && process.env.GITHUB_REF_NAME !== `v${version}`) {
  throw new Error(`Release tag ${process.env.GITHUB_REF_NAME} does not match v${version}.`);
}

if (process.argv.includes("--check")) {
  if (source !== output || !fs.existsSync(distPath) || fs.readFileSync(distPath, "utf8") !== output) {
    throw new Error("Version or distribution is out of sync. Run npm run build.");
  }
} else {
  fs.writeFileSync(sourcePath, output);
  fs.mkdirSync(path.dirname(distPath), { recursive: true });
  fs.writeFileSync(distPath, output);
}
