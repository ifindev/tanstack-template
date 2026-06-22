import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const projectName = process.argv.slice(2).join(" ").trim();
if (!projectName) {
  console.error('Usage: pnpm harness:new-project -- "Project Name"');
  process.exit(1);
}

const root = process.cwd();
const overviewPath = path.join(root, "docs", "specs", "_overview.md");
const taskBoardPath = path.join(root, "docs", "tasks", "_index.md");
const overview = await readFile(overviewPath, "utf8");

if (!overview.includes("Status: NOT_STARTED")) {
  console.error(
    "Refusing to overwrite an initialized project. Reset the scaffold manually if intentional.",
  );
  process.exit(1);
}

const date = new Date().toISOString().slice(0, 10);
const nextOverview = overview
  .replace("# Project Overview", `# Project Overview: ${projectName}`)
  .replace("Status: NOT_STARTED", "Status: DRAFT")
  .replace("Current phase: Bootstrap", "Current phase: Discovery")
  .replace("Last updated: YYYY-MM-DD", `Last updated: ${date}`)
  .replace("- Name:", `- Name: ${projectName}`);

const taskBoard = await readFile(taskBoardPath, "utf8");
const nextTaskBoard = taskBoard
  .replace("# Task Board", `# Task Board: ${projectName}`)
  .replace("Last updated: YYYY-MM-DD", `Last updated: ${date}`);

await writeFile(overviewPath, nextOverview);
await writeFile(taskBoardPath, nextTaskBoard);
console.log(`Initialized workflow scaffold for ${projectName}.`);
