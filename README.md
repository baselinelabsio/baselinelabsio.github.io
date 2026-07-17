# Baseline Labs — GitHub Pages

Static site for Baseline Labs app landing pages, privacy policies, and terms.

## Live URLs (after GitHub Pages is enabled)

| Page | URL |
|------|-----|
| Baseline Labs home | https://baselinelabsio.github.io/ |
| Ieltify landing | https://baselinelabsio.github.io/ieltify/ |
| Ieltify privacy | https://baselinelabsio.github.io/ieltify/privacy.html |
| Ieltify terms | https://baselinelabsio.github.io/ieltify/terms.html |
| Account deletion | https://baselinelabsio.github.io/ieltify/request-account-deletion/ |

Use the **privacy** and **terms** URLs in Google OAuth consent screen and Play Console.

## Account deletion form — env via config.js

The page loads env through:

```html
<script src="config.js"></script>
<script src="app.js"></script>
```

`app.js` reads `window.APP_CONFIG.API_URL` (never hardcodes the backend).

### Production (GitHub Pages)

1. Repo **Settings → Secrets and variables → Actions → Variables**
2. Add variable: `API_URL` = `https://ieltify.eyratech.com` (no trailing slash)
3. On each deploy, the workflow writes `ieltify/request-account-deletion/config.js` from that variable

`config.js` is gitignored so the live URL is not committed.

### Local testing

```bash
cd ieltify/request-account-deletion
cp config.example.js config.js
# edit API_URL if needed, then open index.html
```

Your Nest backend must allow CORS from `https://baselinelabsio.github.io` (see `CORS_ALLOWED_ORIGINS` in `backend/.env.template`).

## Deploy to `baselinelabsio/baselinelabsio.github.io`

### Option A — Copy this folder into the GitHub repo

```bash
git clone https://github.com/baselinelabsio/baselinelabsio.github.io.git
cd baselinelabsio.github.io

# Copy all files from this folder into the clone (index.html, assets/, ieltify/, README.md)
# Then:
git add .
git commit -m "Add Baseline Labs and Ieltify static pages"
git push origin main
```

### Option B — Push from this monorepo subfolder

```bash
cd baselinelabsio.github.io
git init
git remote add origin https://github.com/baselinelabsio/baselinelabsio.github.io.git
git add .
git commit -m "Add Baseline Labs and Ieltify static pages"
git branch -M main
git push -u origin main
```

### Enable GitHub Pages

1. Open https://github.com/baselinelabsio/baselinelabsio.github.io/settings/pages
2. **Source:** Deploy from branch
3. **Branch:** `main` / `/ (root)`
4. Save — site is live in 1–2 minutes

## Add another app later

Duplicate the `ieltify/` folder:

```
/newapp/
  index.html
  privacy.html
  terms.html
```

Add a card on the root `index.html` linking to `/newapp/`.

## Optional: update Android app privacy URL

In `IeltsPrepApp/app/src/main/res/values/strings.xml`:

```xml
<string name="privacy_policy_url">https://baselinelabsio.github.io/ieltify/privacy.html</string>
```

## Screenshot

Replace the placeholder on `ieltify/index.html` with a real image:

```html
<img class="screenshot" src="assets/screenshot.png" alt="Ieltify app screenshot">
```

Put the image at `ieltify/assets/screenshot.png`.
