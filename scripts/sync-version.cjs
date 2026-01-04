const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const pkgPath = path.join(rootDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const version = pkg.version;

const targets = [
  path.join(rootDir, "src", "io", "structure.js"),
  path.join(rootDir, "docs", "source", "_examples", "anymesh.html"),
  path.join(rootDir, "docs", "source", "_examples", "mesh_primitive.html"),
  path.join(rootDir, "docs", "source", "_examples", "quickstart.html"),
  path.join(rootDir, "docs", "source", "_examples", "text_labels.html"),
];

const pattern = /https:\/\/unpkg\.com\/weas@[^/]+\/dist\/index\.mjs/g;
const replacement = `https://unpkg.com/weas@${version}/dist/index.mjs`;

let updated = 0;
targets.forEach((target) => {
  const current = fs.readFileSync(target, "utf8");
  const next = current.replace(pattern, replacement);
  if (next !== current) {
    fs.writeFileSync(target, next);
    updated += 1;
  }
});

if (updated === 0) {
  console.log("No version references updated.");
} else {
  console.log(`Updated version references in ${updated} file(s).`);
}
