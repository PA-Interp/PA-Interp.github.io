import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const publications = JSON.parse(await readFile("src/data/publications.json", "utf8"));
const { researchAreas } = await import("../src/data/researchAreas.js");

const errors = [];
const roles = new Set(["PI", "Postdoc", "PhD Student", "Master Student", "Visiting Student", "Research Assistant"]);

function parseScalar(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(source) {
  const block = source.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!block) return {};

  const data = {};
  let activeList = null;
  for (const line of block.split("\n")) {
    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && activeList) {
      data[activeList].push(parseScalar(listItem[1]));
      continue;
    }

    activeList = null;
    const entry = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!entry) continue;

    const [, key, value] = entry;
    if (!value.trim()) {
      data[key] = [];
      activeList = key;
    } else if (/^\d+$/.test(value.trim())) {
      data[key] = Number(value.trim());
    } else {
      data[key] = parseScalar(value);
    }
  }

  return data;
}

function wordCount(value = "") {
  return value.trim() ? value.trim().split(/\s+/).length : 0;
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (!Array.isArray(publications) || publications.length < 50) {
  errors.push(`Expected at least 50 publications, found ${publications.length}`);
}

for (const publication of publications) {
  for (const key of ["id", "title", "authors", "venue", "year", "summary", "primaryTopic"]) {
    if (!publication[key]) errors.push(`Publication ${publication.id ?? "(unknown)"} missing ${key}`);
  }
  if (!Array.isArray(publication.links) || publication.links.length === 0) {
    errors.push(`Publication ${publication.id} has no links`);
  }
  for (const link of publication.links ?? []) {
    if (!link.label || !link.url) errors.push(`Publication ${publication.id} has an incomplete link`);
  }
  if (publication.authorsHtml && /<(?!\/?(?:span|strong)\b)[^>]+>/i.test(publication.authorsHtml)) {
    errors.push(`Publication ${publication.id} authorsHtml contains unsupported tags`);
  }
  if (publication.mentoredAuthors?.length && !publication.authorsHtml?.includes("mentored-author")) {
    errors.push(`Publication ${publication.id} has mentored authors but no underline markup`);
  }
}

const indexedTopics = new Set(publications.flatMap((publication) => [publication.primaryTopic, ...(publication.secondaryTopics ?? [])]));
for (const area of researchAreas) {
  if (!indexedTopics.has(area.title)) errors.push(`No publication assigned to topic ${area.title}`);
}

const teamFiles = (await readdir("src/content/team")).filter((file) => file.endsWith(".md")).sort();
const teamMembers = [];
for (const file of teamFiles) {
  const member = parseFrontmatter(await readFile(join("src/content/team", file), "utf8"));
  teamMembers.push(member);

  for (const key of ["name", "role", "affiliation", "researchTags", "order"]) {
    if (!member[key] && member[key] !== 0) errors.push(`${file} missing ${key}`);
  }
  if (!roles.has(member.role)) errors.push(`${member.name ?? file} has invalid role ${member.role}`);
  if (!Array.isArray(member.researchTags) || member.researchTags.length === 0) {
    errors.push(`${member.name ?? file} needs at least one research tag`);
  }
  if (member.bio) {
    const words = wordCount(member.bio);
    if (words < 10 || words > 35) errors.push(`${member.name} biography has ${words} words, expected 10-35`);
  }
  if (member.photo) {
    const publicPath = member.photo.startsWith("/") ? member.photo.slice(1) : member.photo;
    if (!(await fileExists(join("public", publicPath)))) errors.push(`${member.name} photo not found: ${member.photo}`);
  }
}

const names = new Set();
const orders = new Set();
for (const member of teamMembers) {
  if (names.has(member.name)) errors.push(`Duplicate team member name: ${member.name}`);
  if (orders.has(member.order)) errors.push(`Duplicate team order: ${member.order}`);
  names.add(member.name);
  orders.add(member.order);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${publications.length} publications, ${researchAreas.length} research areas, and ${teamMembers.length} team members.`);
