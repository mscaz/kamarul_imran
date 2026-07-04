# Academic Profile Site Template

A static, single-page professional website for an academician or researcher — no framework, no build step. Deploys as-is to GitHub Pages. Content is edited in one file, `profile.yaml`.

## What it shows visitors

- Name, qualification, institution address, research interests, and expertise.
- Publication count and h-index (pulled automatically from ORCID and Scopus).
- The 10 most recent publications (from ORCID).
- Link-outs to full ORCID, Scopus, Google Scholar, and Publons profiles.
- A contact form, an optional "schedule a meeting" link, and social/profile badges — for visitor engagement.
- A theme picker (5 built-in color themes) set via one field in `profile.yaml`.

## Setting up a new academician's site (manager workflow)

1. **Create the repo**: from this template repo's GitHub page, click **Use this template → Create a new repository**. Name it for the academician (e.g. `jane-smith-site`).
2. **Edit `profile.yaml`** in the new repo (GitHub's web editor is fine — click the file, click the pencil icon): fill in the required fields (name, qualification, institution address, research interests, expertise) and any optional fields/links the academician wants shown. Set `theme` to one of `classic-navy`, `forest-green`, `ocean-teal`, `slate-minimal`, `warm-maroon`.
3. **If the academician has a Scopus Author ID**: add a repository secret named `SCOPUS_API_KEY` (Settings → Secrets and variables → Actions → New repository secret) using your own Elsevier API key from [dev.elsevier.com](https://dev.elsevier.com). This step does **not** carry over automatically from the template — it must be repeated for every new repo.
4. **Enable GitHub Pages**: Settings → Pages → Source: "Deploy from a branch" → Branch: `main`, folder: `/ (root)`. Save. The site publishes at `https://<your-account>.github.io/<repo-name>/`.
5. **Trigger the first publications fetch**: Actions tab → "Fetch Publications Data" → "Run workflow". This populates `data/publications.json` with real ORCID/Scopus data (it otherwise refreshes automatically every Monday).
6. **Hand off**: tell the academician they only ever need to edit `profile.yaml` (via GitHub's web editor) to update their information.

## Local preview

```
npx serve .
```

Then open the printed `localhost` URL. Do not open `index.html` directly by double-clicking it — the profile loader uses `fetch()`, which browsers block on the `file://` protocol.

## Hosting note

GitHub Pages is recommended and is what this template is built for: free, no extra hosting account per academician, and supports a custom domain later (add a `CNAME` file) if a university wants e.g. `janesmith.university.edu`.
