# CLAUDE.md

This repo is one academician's static professional profile site, created from the "Academic Profile Site Template." It is a plain HTML/CSS/vanilla JS site (no framework, no bundler, no build step to view) meant to be deployed via GitHub Pages.

## Safe to edit

- `profile.yaml` — the single source of truth for all profile content (name, qualification, institution, research interests, expertise, optional links, contact form endpoint, Calendly URL, and `theme`). Almost every content request ("update my bio," "add a publication interest," "change the theme," "add my LinkedIn") should be satisfied by editing this file only.

## Do not hand-edit

- `data/publications.json` — regenerated weekly by `.github/workflows/fetch-publications.yml` (and on manual dispatch from the Actions tab). Manual edits will be overwritten on the next run.
- `.github/workflows/*`, `.github/scripts/*`, `assets/js/*`, `assets/css/base.css` — shared template internals. Changing these diverges an individual site from the template and complicates future maintenance. Only touch them if explicitly asked to (e.g., "add a new theme" or "change how publications are fetched").
- `assets/css/themes/*.css` may be added or edited if explicitly asked to create/tweak a theme.

## Secrets

`SCOPUS_API_KEY` lives only in the repo's Settings → Secrets and variables → Actions. Never write it into any file in this repo, and never suggest hardcoding it into a script.

## How to test locally

No `npm install` is needed to view the site. From the repo root, run any static file server, e.g.:

```
npx serve .
```

or

```
python -m http.server 8000
```

then open the printed URL. Opening `index.html` directly via `file://` will NOT work — `fetch('./profile.yaml')` is blocked by the browser's CORS policy on the `file://` protocol. This is expected, not a bug.

## How the publications data pipeline works

- `.github/workflows/fetch-publications.yml` runs weekly (Monday 03:00 UTC) and on manual "Run workflow" from the Actions tab.
- It reads `orcid_id` / `scopus_author_id` from `profile.yaml`, calls ORCID's public API and (if `SCOPUS_API_KEY` is set) Elsevier's Scopus Author API, and commits the result to `data/publications.json`.
- If publication data looks stale or wrong, check the Actions tab run history before assuming a code bug.
- Missing `scopus_author_id` or `SCOPUS_API_KEY` degrades gracefully — the workflow still succeeds and the site simply hides the Scopus metrics block.
- Google Scholar has no public API and is never scraped (against its Terms of Service) — it is only ever shown as a link-out.

## Non-goals

- No frontend framework or bundler.
- No client-side calls to ORCID/Scopus from visitors' browsers (data is pre-fetched server-side by the Action into a static JSON).
- No Google Scholar scraping.
