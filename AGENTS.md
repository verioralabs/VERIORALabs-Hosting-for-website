# Project Instructions for AI Agents

## Cache-busting version tags (MANDATORY)

Every page loads `styles.css`, `script.js`, and image files with a `?v=YYYYMMDD` query string (e.g. `?v=20260802`). Browsers cache these URLs, so if the filename stays the same but the content changes, visitors keep seeing the old cached copy.

### Automatic rule
When you edit ANY of the following, you MUST also bump the version tag in the same batch of changes:
- Any image file under `images/` (new uploads, replacements, renames)
- Favicons / manifest icons

(Since the Aug 2026 `.htaccess` fix, `styles.css` and `script.js` are served `no-cache, must-revalidate`, so edits to them no longer need a version bump — they revalidate on every visit. See "Do NOT bump" below.)

Steps:
1. Pick a new value — today's date as `YYYYMMDD` is preferred.
2. Find-and-replace the old tag across ALL files that use it (search for the previous `?v=...` value):
   - `index.html`, `team.html`, all service pages, `partners.html`, `software.html`, `academy.html`, `privacy.html`, `terms.html`, `404.html`, and `manifest.json`.
3. **Also update the `VERSION` constant at the top of `sw.js`** to the same value — the service worker cache is keyed on it, so a mismatched value keeps serving stale cached assets.
4. Confirm no occurrences of the old tag remain.

**CRITICAL:** Every image/video reference in every HTML file MUST include a `?v=` tag (search for `src="images/` without a `?v=` — those are invisible to version bumps). Team photos and any content images that lack the tag will never refresh in browsers.

### Always remind the user
After bumping, tell the user:
- Which files were changed and the new version value.
- That they must re-upload the whole folder to cPanel (overwrite existing files).
- That they should hard-refresh (`Ctrl+Shift+R`) once after upload to confirm.

### Do NOT bump
Pure HTML content edits (copy, structure, sections) do not require a bump — HTML is served with `no-cache` by `.htaccess`, so those show immediately. Since the Aug 2026 `.htaccess` fix, **CSS/JS changes also no longer need a bump** (they're `no-cache, must-revalidate` too). Only bump when **images** changed (new uploads, replacements, renames, favicons, manifest icons) — images are still long-cached + `?v=`-busted.

## Troubleshooting: "works locally but looks broken on the live site / in Chrome"

### Symptom
Page is correct locally (double-click the HTML file) but the uploaded cPanel version looks old, unstyled, or out of date in Chrome.

### Diagnosis first — do NOT assume the upload is wrong
Fetch the live files before changing anything:
- `https://www.verioralabs.com/` (HTML)
- `.../styles.css?v=<tag>` and `.../script.js?v=<tag>`
- image paths referenced in the page

If the live server serves the correct content, the upload is fine and the problem is browser/CDN caching, not the files. Never bump version tags blindly without checking the live HTML first — if the live page is genuinely old, the user may not have uploaded at all.

### Known causes and fixes (in order of likelihood)
1. **Mixed old/new files because CSS/JS is long-cached (root cause of the Aug 2026 incident).** The `.htaccess` used to serve CSS/JS with `Cache-Control: public, max-age=2592000` (1 month), relying entirely on the `?v=` tag. If the browser cached `styles.css?v=20260810` before a fix finished uploading, it kept the old copy for a month — so some files were fresh and others stale at the same time. **This is now fixed permanently in `.htaccess`:** CSS/JS are served `no-cache, must-revalidate` (same as HTML), so browsers revalidate on every visit and version bumps are no longer needed for CSS/JS changes (only for images, which are still long-cached + `?v=`-busted).
   - Diagnosis: fetch the live file and compare with local. If they match but the browser still shows old content, the browser's cache headers are the culprit.
   - Fix: `?v=` bump one final time to force browsers to drop old month-cached copies, re-upload the **whole folder including `.htaccess`**, then hard-refresh.
2. **Browser cache (older cause, now mostly prevented).** Chrome keeps the old page/CSS/JS. Fix: bump the version tag (see rules above) so `?v=` changes and Chrome fetches fresh files. Remind user to hard-refresh (`Ctrl+Shift+R`) or open in incognito once.
3. **Host caching layer.** cPanel hosts often run LiteSpeed Cache, Cloudflare, or similar. Ask the user to purge it from the hosting panel after uploads. Check response headers for `X-LiteSpeed-Cache` / `X-LiteSpeed-Cache-Hit` / `cf-cache-status` — empty means the host cache is off and the browser is the problem.
4. **Files in the wrong place.** The zip got extracted into a subfolder inside `public_html` instead of directly at the root, or files were renamed with different capitalization (Linux is case-sensitive, Windows/Mac are not). Confirm `index.html` sits at `public_html/` root.

### Service worker serving stale assets (PWA-only, easy to miss)
Even with correct files and correct `.htaccess`, an installed/registered service worker intercepts fetches and can serve its OWN cached copy of assets. The worker caches under `veriora-labs-<VERSION>` and purges old caches on activate, but the browser only swaps workers on reload — so the fix appears one reload later.
- Diagnosis: DevTools → Application → Service Workers shows the registered worker and its cache.
- Fix: DevTools → Application → Storage → **Clear site data** (unregisters the worker and wipes its cache), close the tab, reopen. If the site is installed as a PWA app window, uninstall + reinstall the app.
- This is the #1 reason "everything on the server is correct but the client still sees old content" — always check this before touching any files.

### PWA ("site not installable", offline not working, broken manifest)
The site is a PWA and requires ALL of the following — if any is missing, Chrome DevTools → Application will flag it:

1. **`sw.js`** — service worker at site root, with a `VERSION` constant matching the current `?v=` tag. Cache name is `veriora-labs-<VERSION>`. Old caches are purged on activate.
2. **SW registration** — `script.js` registers `"sw.js"` on `window.load`. Without this, no install prompt/offline support.
3. **`.htaccess`** — `sw.js` MUST be served `no-cache, no-store` (see the `FilesMatch "sw\.js$"` block). If the browser caches the old worker, updates never reach visitors.
4. **`manifest.json`** — needs: `name`, `short_name`, `start_url: "./index.html"`, `scope: "./"`, `display: "standalone"`, theme/background color, and icons at **64x64, 192x192, and 512x512** (`images/icons/icon-192.png` and `icon-512.png` exist).
5. **Manifest link tag** — every main page links it with a version tag: `<link rel="manifest" href="manifest.json?v=<tag>">`.

After ANY change to sw.js, manifest.json, icons, or assets: bump the version tag AND the sw.js `VERSION` together, then tell the user to re-upload everything and hard-refresh. Note: the old service worker swaps after one extra reload by design — that's normal browser behavior, not a bug.
