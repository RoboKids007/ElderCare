# Elder Health Assessment App (MOMOs-style)

A production-ready refactor of the single-file elder health assessment web app:
- Questionnaire → Domain scoring → Medical risk models (Frailty/Falls/Depression/Cognition)
- Consolidated report generation
- Save assessments to `localStorage` (acts like a simple history DB)
- Family dashboard (search/filter/load/delete)
- Export the report as a PDF using `jsPDF`

> **Disclaimer**: This is a screening tool and not a medical diagnosis.

---

## Tech stack

- Vite (build/dev server)
- Modern ES Modules (`import` / `export`)
- `jsPDF` via npm (no CDN dependency)

---

## Folder structure

```
elder-health-assessment-app/
  src/
    index.html
    css/
      styles.css
    js/
      main.js
      app/
        state.js
        dom.js
        toast.js
        tabs.js
      config/
        appConfig.js
      data/
        questionnaire.js
      features/
        scoring.js
        report.js
        storage.js
        pdf.js
        dashboard.js
        sample.js
  scripts/
    basic-lint.js
  vite.config.js
  package.json
  LICENSE
```

---

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

---

## Build

```bash
npm run build
npm run preview
```

Build output will be in `dist/`.

---

## Deploy to GitHub Pages (Vite)

### 1) Create repo + push

```bash
git init
git add .
git commit -m "Initial commit: elder assessment app"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
git push -u origin main
```

### 2) Configure base path (important)

For GitHub Pages (project pages), your app is served under:

```
https://<YOUR_USERNAME>.github.io/<YOUR_REPO>/
```

So Vite needs `base="/<YOUR_REPO>/"`.

**Option A (recommended):** set repo name as env var during build

```bash
VITE_BASE_PATH="/<YOUR_REPO>/" npm run build
```

**Option B:** edit `vite.config.js` and set `base` to `"/<YOUR_REPO>/"`.

### 3) Publish `dist/` to GitHub Pages

Simplest: use GitHub UI:

1. Build locally: `npm run build`
2. In GitHub repo → Settings → Pages
3. Source: **Deploy from a branch**
4. Select branch: `gh-pages` (or `main`) and folder: `/root` or `/docs` if you move it.

Recommended approach: use a `gh-pages` branch:

```bash
# build
VITE_BASE_PATH="/<YOUR_REPO>/" npm run build

# create gh-pages branch containing dist
git checkout --orphan gh-pages
git --work-tree dist add --all
git --work-tree dist commit -m "Deploy"
git push origin HEAD:gh-pages
git checkout main
```

Then in Settings → Pages:
- Source: **Deploy from a branch**
- Branch: `gh-pages` / root

---

## Code quality notes

- No global variables: all app state is in `src/js/app/state.js`
- Runtime safety: basic try/catch around localStorage + PDF export
- Minimal comments: only where needed for clarity
- Dead/duplicate code removed during refactor

---

## License

MIT (see `LICENSE`)
