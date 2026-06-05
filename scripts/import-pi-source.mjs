import { mkdir, writeFile } from "node:fs/promises";

const PUBLICATION_URL =
  "https://raw.githubusercontent.com/lijie-hu/lijie-hu.github.io/refs/heads/master/_pages/publication.md";
const PUB_FULL_URL =
  "https://raw.githubusercontent.com/lijie-hu/lijie-hu.github.io/refs/heads/master/_pages/pub_full.md";

const TOPICS = {
  theory: "Theoretical Foundations of Usable XAI",
  largeModels: "Useful XAI in Large Models",
  systems: "Systems for XAI",
  interactive: "Interactive XAI",
  science: "XAI for Science"
};

const ARTIFACT_LABELS = new Map([
  ["link", "paper"],
  ["paper", "paper"],
  ["pdf", "paper"],
  ["arxiv", "preprint"],
  ["code", "code"],
  ["github", "code"],
  ["video", "video"],
  ["demo", "demo"],
  ["data", "data"],
  ["slides", "slides"],
  ["bibtex", "bibtex"]
]);

function stripTags(value = "") {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatStrongHtml(value = "") {
  const fragments = [];
  let text = value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  text = text.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, (_, inner) => {
    const token = `__PAI_STRONG_${fragments.length}__`;
    fragments.push(`<strong>${escapeHtml(stripTags(inner))}</strong>`);
    return token;
  });

  let formatted = escapeHtml(stripTags(text));
  fragments.forEach((fragment, index) => {
    formatted = formatted.replace(`__PAI_STRONG_${index}__`, fragment);
  });
  return formatted;
}

function formatAuthorsHtml(value = "") {
  const fragments = [];
  let text = value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  text = text.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, (_, inner) => {
    const token = `__PAI_MENTORED_${fragments.length}__`;
    fragments.push(`<span class="mentored-author">${formatStrongHtml(inner)}</span>`);
    return token;
  });

  text = text.replace(/<b\b[^>]*>([\s\S]*?)<\/b>/gi, (_, inner) => {
    const token = `__PAI_STRONG_${fragments.length}__`;
    fragments.push(`<strong>${escapeHtml(stripTags(inner))}</strong>`);
    return token;
  });

  let formatted = escapeHtml(stripTags(text));
  fragments.forEach((fragment, index) => {
    formatted = formatted.replace(`__PAI_MENTORED_${index}__`, fragment);
    formatted = formatted.replace(`__PAI_STRONG_${index}__`, fragment);
  });
  return formatted;
}

function extractMentoredAuthors(value = "") {
  return [...value.matchAll(/<u\b[^>]*>([\s\S]*?)<\/u>/gi)]
    .map((match) => stripTags(match[1]).replace(/[*†]/g, "").trim())
    .filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function normalizeArxivUrl(url) {
  if (!url || !/arxiv\.org/i.test(url)) return url;
  const id = url
    .replace(/https?:\/\/(www\.)?arxiv\.org\/(abs|pdf)\//i, "")
    .replace(/\.pdf$/i, "")
    .split(/[?#]/)[0];
  return `https://arxiv.org/abs/${id}`;
}

function extractArxivId(url) {
  const normalized = normalizeArxivUrl(url);
  const match = normalized?.match(/arxiv\.org\/abs\/([^?#]+)/i);
  return match?.[1];
}

function extractOpenReviewId(url = "") {
  if (!url.includes("openreview.net")) return null;
  return url.match(/[?&](?:id|forum)=([^&#]+)/)?.[1] ?? null;
}

function parseLinks(block) {
  const links = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of block.matchAll(re)) {
    const rawLabel = stripTags(match[2]).replace(/^\[|\]$/g, "").toLowerCase();
    const label = rawLabel || "link";
    const url = normalizeArxivUrl(match[1]);
    const type = ARTIFACT_LABELS.get(label) ?? (url.includes("github.com") ? "code" : "paper");
    links.push({ label: label.replace(/^\w/, (c) => c.toUpperCase()), type, url });
  }
  return links;
}

function parseTitle(block) {
  const italic = block.match(/<i>([\s\S]*?)<\/i>/i)?.[1] ?? block;
  const venueShort = stripTags(italic.match(/<b[^>]*>\s*\[([^\]]+)\]\s*<\/b>/i)?.[1] ?? "");
  let title = stripTags(italic)
    .replace(/^\[[^\]]+\]\s*/, "")
    .replace(/\[(Link|ArXiv|Code|code|Video|Demo|Data|Slides|BibTeX|PDF)\]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  title = title.replace(/\s+\.$/, ".");
  return { title, venueShort };
}

function classify(text) {
  const haystack = text.toLowerCase();
  const matches = [];
  const add = (key, score) => matches.push([TOPICS[key], score]);

  if (/(protein|histology|medical|health|diagnosis|autonomous driving|science|scientific|material|marine|biology|clinical|stain-free)/.test(haystack)) {
    add("science", 4);
  }
  if (/(llm|large language|language model|vlm|mllm|multimodal|transformer|diffusion|knowledge editing|unlearning|sparse autoencoder|reasoning|steering|representation intervention|video-llm|clip)/.test(haystack)) {
    add("largeModels", 4);
  }
  if (/(system|toolkit|benchmark|pipeline|monitor|deployment|deployable|service|migration|acceleration|infrastructure|dataset|reproducib)/.test(haystack)) {
    add("systems", 3);
  }
  if (/(interactive|human-ai|human ai|feedback|decision support|recourse|actionable|sycophancy|alignment|co-adaptation|user)/.test(haystack)) {
    add("interactive", 3);
  }
  if (/(faithful|faithfulness|stable|stability|explainable attention|concept bottleneck|influence|guarantee|provable|theoretical|uncertainty|privacy|differentially private|optimization|controllable|consistency)/.test(haystack)) {
    add("theory", 4);
  }

  if (!matches.length) add("theory", 1);
  matches.sort((a, b) => b[1] - a[1]);
  const unique = [...new Map(matches.map(([topic, score]) => [topic, score])).entries()];
  return {
    primaryTopic: unique[0][0],
    secondaryTopics: unique.slice(1, 3).map(([topic]) => topic),
    confidence: unique[0][1] >= 4 ? "medium" : "low"
  };
}

function firstSentence(text) {
  const cleaned = stripTags(text).replace(/\s+/g, " ");
  const sentence = cleaned.match(/^(.{60,220}?[.!?])\s/)?.[1] ?? cleaned.slice(0, 190);
  return sentence.trim();
}

function buildSummary(title, primaryTopic, abstract) {
  if (abstract) return firstSentence(abstract);
  const topicLabels = {
    [TOPICS.theory]: "usable XAI foundations",
    [TOPICS.largeModels]: "large-model interpretability",
    [TOPICS.systems]: "XAI systems",
    [TOPICS.interactive]: "interactive explanations",
    [TOPICS.science]: "scientific discovery"
  };
  const cleanTitle = title.replace(/[.。]\s*$/, "");
  return `Studies ${cleanTitle} as part of PAI's work on ${topicLabels[primaryTopic] ?? "actionable interpretability"}.`;
}

async function fetchText(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "pai-lab-site-importer" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchArxivAbstract(arxivId) {
  if (!arxivId) return null;
  try {
    const xml = await fetchText(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(arxivId)}`, 8000);
    return xml.match(/<summary>([\s\S]*?)<\/summary>/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
  } catch {
    return null;
  }
}

async function fetchJson(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "pai-lab-site-importer" },
      signal: controller.signal
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function comparableTitle(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function fetchSemanticScholarAbstract(title, year) {
  const url = `https://api.semanticscholar.org/graph/v1/paper/search/match?query=${encodeURIComponent(title)}&fields=title,abstract,year,venue,externalIds,url`;
  const payload = await fetchJson(url);
  const match = payload?.data?.[0];
  if (!match?.abstract) return null;
  const sameTitle = comparableTitle(match.title ?? "") === comparableTitle(title);
  const closeYear = !match.year || !year || Math.abs(Number(match.year) - Number(year)) <= 1;
  return sameTitle && closeYear ? match.abstract : null;
}

async function fetchOpenReviewAbstract(openReviewId) {
  if (!openReviewId) return null;
  const payload = await fetchJson(`https://api2.openreview.net/notes?forum=${encodeURIComponent(openReviewId)}`, 7000);
  const note = payload?.notes?.[0];
  const abstract = note?.content?.abstract;
  return typeof abstract === "string" ? abstract : abstract?.value ?? null;
}

function applyAbstract(publication, abstract, source) {
  const classification = classify(`${publication.title} ${publication.venue} ${abstract}`);
  publication.abstract = abstract;
  publication.summary = buildSummary(publication.title, classification.primaryTopic, abstract);
  publication.primaryTopic = classification.primaryTopic;
  publication.secondaryTopics = classification.secondaryTopics;
  publication.classificationSource = source;
  publication.classificationConfidence = "high";
  publication.needsReview = false;
  publication.tags = [...new Set([publication.primaryTopic, ...publication.secondaryTopics, publication.venueShort, ...publication.artifacts])].filter(Boolean);
}

function extractItems(raw) {
  const items = [];
  let currentYear = "";
  let currentType = "";
  let collecting = false;
  let block = [];

  for (const line of raw.split("\n")) {
    const yearMatch = line.match(/<h2>.*?\b(19\d{2}|20\d{2})\b.*?<\/h2>/i);
    if (yearMatch) currentYear = yearMatch[1];

    const typeMatch = line.match(/<h3>(.*?)<\/h3>/i);
    if (typeMatch) currentType = stripTags(typeMatch[1]);

    if (line.includes("<li><p>")) {
      collecting = true;
      block = [line];
      if (line.includes("</p>")) {
        items.push({ block: block.join("\n"), year: currentYear, type: currentType });
        collecting = false;
      }
      continue;
    }

    if (collecting) {
      block.push(line);
      if (line.includes("</p>")) {
        items.push({ block: block.join("\n"), year: currentYear, type: currentType });
        collecting = false;
      }
    }
  }

  return items;
}

function parsePublication(item, sourceOrder, representativeTitles) {
  const { block, year, type } = item;
  const { title, venueShort } = parseTitle(block);
  const rawParts = block
    .replace(/<li><p>/i, "")
    .replace(/<\/p>.*/is, "")
    .split(/<br\s*\/?>/i);
  const parts = rawParts.map(stripTags).filter(Boolean);

  const authors = parts[1] ?? "";
  const authorsRaw = rawParts[1] ?? "";
  const venue = parts[2] ?? "";
  const notes = parts.slice(3).join(" ");
  const links = parseLinks(block);
  const haystack = [title, authors, venue, notes].join(" ");
  const classification = classify(haystack);
  const artifactTypes = [...new Set(links.map((link) => link.type))];
  const tags = [
    classification.primaryTopic,
    ...classification.secondaryTopics,
    venueShort,
    ...artifactTypes.map((artifact) => artifact[0].toUpperCase() + artifact.slice(1))
  ].filter(Boolean);

  return {
    id: `${year}-${slugify(title)}`,
    title,
    authors,
    authorsHtml: formatAuthorsHtml(authorsRaw),
    mentoredAuthors: extractMentoredAuthors(authorsRaw),
    venue,
    venueShort,
    year: Number(year),
    type: type || "Publication",
    abstract: "",
    summary: buildSummary(title, classification.primaryTopic, ""),
    primaryTopic: classification.primaryTopic,
    secondaryTopics: classification.secondaryTopics,
    tags: [...new Set(tags)],
    links,
    artifacts: artifactTypes,
    sourceOrder,
    representative: representativeTitles.has(title),
    classificationSource: "title",
    classificationConfidence: classification.confidence,
    needsReview: classification.confidence === "low",
    notes
  };
}

async function main() {
  const [publicationRaw, pubFullRaw] = await Promise.all([fetchText(PUBLICATION_URL), fetchText(PUB_FULL_URL)]);
  const representativeTitles = new Set(
    extractItems(pubFullRaw)
      .slice(0, 5)
      .map((item) => parseTitle(item.block).title)
  );

  const publications = extractItems(publicationRaw).map((item, index) =>
    parsePublication(item, index + 1, representativeTitles)
  );

  const enrich = process.argv.includes("--network");
  if (enrich) {
    let cursor = 0;
    const useArxiv = process.argv.includes("--arxiv");
    const worker = async () => {
      while (cursor < publications.length) {
        const publication = publications[cursor++];
      const arxivUrl = publication.links.find((link) => link.url.includes("arxiv.org"))?.url;
      const arxivId = extractArxivId(arxivUrl);
        const openReviewUrl = publication.links.find((link) => link.url.includes("openreview.net"))?.url;
        const openReviewId = extractOpenReviewId(openReviewUrl);
        const semantic = await fetchSemanticScholarAbstract(publication.title, publication.year);
        const openReview = semantic ? null : await fetchOpenReviewAbstract(openReviewId);
        const arxiv = semantic || openReview || !useArxiv ? null : await fetchArxivAbstract(arxivId);
        const abstract = semantic ?? openReview ?? arxiv;
      if (abstract) {
          applyAbstract(publication, abstract, semantic ? "semantic-scholar" : openReview ? "openreview" : "arxiv");
        }
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));
  }

  publications.sort((a, b) => b.year - a.year || a.sourceOrder - b.sourceOrder);
  await mkdir("src/data", { recursive: true });
  await writeFile("src/data/publications.json", `${JSON.stringify(publications, null, 2)}\n`);
  console.log(`Generated ${publications.length} publications in src/data/publications.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
