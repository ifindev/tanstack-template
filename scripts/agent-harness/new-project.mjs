import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectName = process.argv.slice(2).join(" ").trim();
if (!projectName) {
  console.error('Usage: pnpm harness:new-project -- "Project Name"');
  process.exit(1);
}

const root = process.cwd();
const briefPath = path.join(root, "docs", "project-brief.md");
const brief = await readFile(briefPath, "utf8");

if (!brief.includes("<Project Name>")) {
  console.error(
    "Refusing to overwrite an initialized brief. The project-brief.md already names a project. Reset the scaffold manually if intentional.",
  );
  process.exit(1);
}

const nextBrief = brief.replaceAll("<Project Name>", projectName);
await writeFile(briefPath, nextBrief);

console.log(`Initialized project-brief.md for ${projectName}.`);
console.log("Next: invoke /project-brief (or $project-brief) and describe your project.");
