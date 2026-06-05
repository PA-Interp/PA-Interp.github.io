import { defineConfig } from "astro/config";

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
  devToolbar: {
    enabled: false
  },
  output: "static"
});
