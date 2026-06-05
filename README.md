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
