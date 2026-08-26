# Veriora Labs — Website

A production-ready, static marketing site for Veriora Labs. Vanilla HTML/CSS/JS — no build step, no framework, no dependencies.

## What's in this folder

```
index.html        Homepage (hero, why us, solutions, process, industries, leadership, promise, CTA)
partners.html     Partners page — B2B/offshore/white-label positioning for agencies & IT companies
privacy.html       Privacy Policy
terms.html         Terms of Service
404.html           Custom not-found page
styles.css         All styles (design tokens live at the top as CSS variables)
script.js          Nav toggle, scroll header state, scroll-reveal animations
manifest.json      Web app manifest
robots.txt         Search engine crawl rules
sitemap.xml        Sitemap for search engines
images/logo.png    Your logo
images/icons/favicon.svg  Site favicon (V mark)
```

## Before you deploy — 3 things to update

1. **Domain name.** Every file currently uses `https://www.verioralabs.com` as a placeholder (in `<meta>` tags, `sitemap.xml`, `robots.txt`, and the structured-data script in `index.html`). Find-and-replace that with the exact domain you bought on Namecheap.
2. **Contact emails.** The footer and final CTA use `sales@`, `support@`, `info@`, `ceo@`, and `projects@` at `verioralabs.com`. Set these up as real inboxes (they can all forward to one address to start — see your Price & Service notes on this) or edit them to match your actual domain.
3. **Discovery call booking.** "Book a Free Discovery Call" now opens a modal with three ways to reach you, instead of relying on a `mailto:` link (which does nothing for visitors without a desktop email client set up). Two things to configure in `index.html` (search for `BOOKING MODAL`):
   - **"Pick a time" tab:** replace the placeholder Calendly URL (`https://calendly.com/verioralabs/discovery-call`) with your real Calendly or Cal.com scheduling link, in the `<iframe src="...">`.
   - **"Send a message" tab:** ✅ already configured — the form posts to Web3Forms with your access key, so submissions are emailed straight to you with no mail client involved on the visitor's end. If you ever need to change which inbox receives these, get a new key at [web3forms.com](https://web3forms.com) and swap the `access_key` value in `index.html`.
   - The **"Other ways to reach us"** tab currently shows email + LinkedIn. There's a commented-out spot to add phone/WhatsApp once you have a business number.

## Deploying — pick one

### Option A: Netlify (drag and drop, easiest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag this entire folder into the browser window
3. Netlify gives you a live URL immediately
4. Go to **Site settings → Domain management → Add a domain** and enter your Namecheap domain
5. Netlify will show you DNS records (usually an A record + CNAME). Add those in **Namecheap → Domain List → Manage → Advanced DNS**
6. DNS changes can take up to 24–48 hours to propagate; Netlify auto-issues a free HTTPS certificate once it's verified

### Option B: Vercel
1. Go to [vercel.com](https://vercel.com), create a project, and choose "Deploy without a Git repository" or connect a GitHub repo containing this folder
2. Once deployed, go to **Project → Settings → Domains** and add your domain
3. Vercel gives you DNS records — add them in Namecheap's Advanced DNS tab the same way as above

### Option C: GitHub Pages
1. Create a GitHub repository and push all files in this folder to the `main` branch
2. In the repo, go to **Settings → Pages**, set the source to the `main` branch, root folder
3. Add a `CNAME` file to the repo root containing just your domain, e.g. `www.verioralabs.com`
4. In Namecheap, add a CNAME record pointing `www` to `yourusername.github.io`, and A records for the apex domain pointing to GitHub's IPs (GitHub Pages docs list the current ones)

## Connecting your Namecheap domain (all three options)

1. Log into Namecheap → **Domain List** → click **Manage** next to your domain → **Advanced DNS**
2. Delete any default parking-page records
3. Add the records your host (Netlify/Vercel/GitHub) gives you after you add the domain in their dashboard
4. Set `www` as a CNAME to your host, and decide whether `www.verioralabs.com` or `verioralabs.com` (apex) is your primary — redirect the other to it in your host's domain settings

## Uploading a new logo or editing styles.css / script.js

Every logo/icon image and `styles.css`/`script.js` are loaded with a `?v=20260722` version tag so browsers don't keep showing a cached old copy after you upload a replacement under the same filename. **If you swap in a new logo or edit styles/scripts, bump that version number** — pick a new value (today's date as `YYYYMMDD` is easiest) and find-and-replace `20260722` with it across `index.html`, `404.html`, `privacy.html`, `terms.html`, and `manifest.json`. No need to rename any actual files. There's a fuller explanation of this at the top of `index.html`.

## Troubleshooting: live site not matching what you uploaded

If the site looks right locally but not on your live domain — pages look outdated after you update them, or link previews don't load in Facebook/Messenger/WhatsApp — it's almost always one of these:

1. **Old design keeps showing after you update.** This is browser/CDN caching, not a broken deploy — `styles.css` and `script.js` are now loaded with a version tag (`?v=20260721`) so browsers grab the new file on every update. If you still see the old version after uploading, do a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`) to confirm, and check whether your domain has Cloudflare or a cPanel caching feature (e.g. LiteSpeed Cache) turned on — if so, purge its cache after each upload too.
2. **Doesn't load at all in Facebook/Messenger.** Paste your URL into Facebook's [Sharing Debugger](https://developers.facebook.com/tools/debug/) and hit "Scrape Again" — it'll show the exact error. On shared cPanel hosting the usual cause is a security/firewall module (mod_security, Imunify360, etc.) blocking crawler user-agents like `facebookexternalhit` and `WhatsApp`; ask your host to allowlist them. Also confirm your SSL certificate covers both `verioralabs.com` and `www.verioralabs.com` — Facebook's crawler is strict about this even when regular browsers tolerate it.
3. **Works locally, breaks on cPanel.** Two common causes: the zip got extracted into a subfolder in File Manager instead of directly into `public_html` (check that `index.html` sits right at the root), or a file got renamed with different capitalization during upload — Linux servers are case-sensitive, unlike Windows/Mac.

A `.htaccess` file is included in this package with sane cache headers, a forced `www` + HTTPS redirect (matching the canonical URLs already used throughout the site), and a commented-out mod_security allowlist rule for crawler bots if your host gives you access to it.



No build tools needed. Just open `index.html` in a browser, or run a tiny local server so relative paths behave exactly like production:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Notes

- All copy is sourced from your company handbook, business model, pricing, and sales process documents — nothing was invented beyond what those documents establish.
- The Leadership section includes a CEO card using only the role responsibilities defined in your company structure (Business Strategy, Sales, Marketing, Finance) since no personal bio was provided — replace the placeholder text with your own bio whenever you're ready.
- Icons are hand-built inline SVG (no icon font, no external icon library) to keep the page fast and dependency-free.
- Fonts are IBM Plex Sans / IBM Plex Mono, loaded from Google Fonts via `<link>` tags in each HTML file.
