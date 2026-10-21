import { getCollection } from "astro:content";
import { withBase } from "../data/site.js";

export interface Publication {
  id: string;
  title: string;
  authors: string;
  authorsHtml?: string;
  mentoredAuthors?: string[];
  venue: string;
  venueShort: string;
  year: number;
  type: string;
  abstract: string;
  summary: string;
  primaryTopic: string;
  secondaryTopics: string[];
  tags: string[];
  links: Array<{ label: string; type: string; url: string }>;
  artifacts: string[];
  representative: boolean;
}

export const memberSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return entities[char];
  });

let teamLinksPromise: Promise<Array<{ name: string; href: string }>> | undefined;

const getTeamLinks = () => {
  teamLinksPromise ??= getCollection("team").then((entries) =>
    entries
      .map((entry) => ({
        name: entry.data.name,
        href: `${withBase("/team/")}#member-${memberSlug(entry.data.name)}`
      }))
      // Longest names first so a short name never matches inside a longer one.
      .sort((a, b) => b.name.length - a.name.length)
  );
  return teamLinksPromise;
};

/** Author list as HTML, with lab members linked to their entry on the People page. */
export async function formatAuthors(paper: Publication) {
  const source = paper.authorsHtml || escapeHtml(paper.authors);
  const members = await getTeamLinks();

  return members.reduce((html, member) => {
    const pattern = new RegExp(`\\b${escapeRegExp(member.name)}\\b`, "g");
    return html.replace(pattern, `<a class="team-author-link" href="${member.href}">${member.name}</a>`);
  }, source);
}

const linkLabels: Record<string, string> = {
  Link: "Paper",
  Arxiv: "arXiv",
  Code: "Code",
  Video: "Video"
};

/** Links worth showing on an entry; the generic "Source" link to the PI homepage is dropped. */
export function paperLinks(paper: Publication) {
  return paper.links
    .filter((link) => link.label in linkLabels)
    .map((link) => ({ label: linkLabels[link.label], url: link.url }));
}

export function papersForTopic(publications: Publication[], topic: string) {
  const primary = publications.filter((paper) => paper.primaryTopic === topic);
  const secondary = publications.filter((paper) => paper.primaryTopic !== topic && paper.secondaryTopics?.includes(topic));
  // Representative papers lead, then the rest in source (newest-first) order.
  primary.sort((a, b) => Number(b.representative) - Number(a.representative));
  return [...primary, ...secondary];
}
