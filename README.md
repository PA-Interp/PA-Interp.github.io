# PAI Lab Website

Static website for PAI Lab: Provable. Actionable. Interpretability.

The site is built with Astro and is designed for GitHub Pages deployment. It includes the lab homepage, research map, publications archive, team directory, news, and join-us page.

## Development

```bash
npm ci
npm run dev
```

Local development defaults to the root path:

```text
http://127.0.0.1:4321/
```

## Validation

```bash
npm run check
npm run validate:data
npm run build
```

## GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

For the organization site repository `PA-Interp/PA-Interp.github.io`, the workflow builds the site with:

```text
SITE_URL=https://pa-interp.github.io
BASE_PATH=/
```

After pushing to `main`, enable GitHub Pages in the repository settings:

1. Go to `Settings -> Pages`.
2. Set `Source` to `GitHub Actions`.
3. Run the `Deploy to GitHub Pages` workflow or push to `main`.

## Visitor analytics

GoatCounter tracks the lab pages and static project pages, including `/riboloop/`,
in the same dashboard at https://pai.goatcounter.com/. Use the page paths to
distinguish their traffic.

The GitHub repository Actions variable `GOATCOUNTER_ENDPOINT` is set to
`https://pai.goatcounter.com/count`. This is a public URL, not an API key.
Run the deployment workflow after changing the variable.

The build adds GoatCounter's asynchronous script to every HTML page, including
project pages copied from `public/`. Replacing a project's static files therefore
does not remove tracking from the next deployment. Leave the variable unset to
build without analytics; `astro dev` does not add it. GoatCounter also ignores
localhost visits by default.

To exclude your own browser's visits, open
`https://pa-interp.github.io/#toggle-goatcounter` and follow the prompt.
