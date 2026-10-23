import { defineConfig } from "astro/config";
import { readdir, readFile, writeFile } from "node:fs/promises";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isUserOrOrganizationSite = repositoryName?.endsWith(".github.io");
const defaultBase = process.env.GITHUB_ACTIONS && repositoryName && !isUserOrOrganizationSite ? `/${repositoryName}` : "/";
const base = process.env.BASE_PATH ?? defaultBase;
const site =
  process.env.SITE_URL ??
  (process.env.GITHUB_REPOSITORY_OWNER
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER.toLowerCase()}.github.io`
    : "https://pa-interp.github.io");

export default defineConfig({
  site,
  base,
  integrations: [{
    name: "goatcounter",
    hooks: {
      "astro:build:done": async ({ dir }) => {
        const endpoint = process.env.GOATCOUNTER_ENDPOINT;
        if (!endpoint) return;

        // Include project HTML copied from public/, which bypasses Astro layouts.
        const script = `<script data-goatcounter="${endpoint}" async src="https://gc.zgo.at/count.js"></script>`;
        for (const file of await readdir(dir, { recursive: true })) {
          if (!file.endsWith(".html")) continue;
          const url = new URL(file, dir);
          const html = await readFile(url, "utf8");
          if (html.includes("data-goatcounter=")) continue;
          await writeFile(url, html.replace("</head>", `${script}</head>`));
        }
      }
    }
  }],
  devToolbar: {
    enabled: false
  },
  output: "static"
});
