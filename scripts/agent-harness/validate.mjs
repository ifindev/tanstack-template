import { lstat, readdir, readFile, readlink } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const canonicalSkills = path.join(root, ".agents", "skills");
const claudeSkills = path.join(root, ".claude", "skills");
const errors = [];

const requiredProjectFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "docs/ai-workflow/README.md",
  "docs/project-brief.md",
  "docs/trackers.md",
  "docs/_templates/project-brief.md",
  "docs/_templates/_epic.md",
  "docs/_templates/story.md",
];

async function exists(filePath) {
  try {
    await lstat(filePath);
    return true;
  } catch {
    return false;
  }
}

for (const relativePath of requiredProjectFiles) {
  if (!(await exists(path.join(root, relativePath)))) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

const entries = await readdir(canonicalSkills, { withFileTypes: true });
const skillNames = entries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

for (const skillName of skillNames) {
  const skillFile = path.join(canonicalSkills, skillName, "SKILL.md");
  if (!(await exists(skillFile))) {
    errors.push(`Missing SKILL.md: .agents/skills/${skillName}`);
    continue;
  }

  const content = await readFile(skillFile, "utf8");
  const frontmatter = content.split("---", 3)[1] ?? "";
  const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);

  if (nameMatch?.[1].trim() !== skillName) {
    errors.push(`Skill name mismatch: ${skillName}`);
  }
  if (!descriptionMatch?.[1].trim()) {
    errors.push(`Missing single-line description: ${skillName}`);
  }
  if (content.includes("TODO")) {
    errors.push(`Unresolved TODO in skill: ${skillName}`);
  }

  const claudePath = path.join(claudeSkills, skillName);
  if (!(await exists(claudePath))) {
    errors.push(`Missing Claude skill exposure: ${skillName}`);
    continue;
  }

  const stat = await lstat(claudePath);
  if (!stat.isSymbolicLink()) {
    errors.push(
      `Claude skill must be a symlink to canonical source: ${skillName}`,
    );
    continue;
  }

  const target = await readlink(claudePath);
  const resolvedTarget = path.resolve(claudeSkills, target);
  if (resolvedTarget !== path.join(canonicalSkills, skillName)) {
    errors.push(`Incorrect Claude symlink target: ${skillName} -> ${target}`);
  }
}

if (errors.length > 0) {
  console.error("Agent harness validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Agent harness valid: ${skillNames.length} canonical skills.`);
