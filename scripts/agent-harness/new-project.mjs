import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = process.argv.slice(2);
const projectName = (args[0] === "--" ? args.slice(1) : args).join(" ").trim();
if (!projectName) {
  console.error('Usage: pnpm harness:new-project -- "Project Name"');
  process.exit(1);
}

const root = process.cwd();
const prdPath = path.join(root, "docs", "prd.md");
const prd = await readFile(prdPath, "utf8");

if (!prd.includes("<Project Name>")) {
  console.error(
    "Refusing to overwrite an initialized PRD. The prd.md already names a project. Reset the scaffold manually if intentional.",
  );
  process.exit(1);
}

const nextPrd = prd.replaceAll("<Project Name>", projectName);
await writeFile(prdPath, nextPrd);

console.log(`Initialized prd.md for ${projectName}.`);
console.log("Next: invoke /prd (or $prd) and describe your project.");
