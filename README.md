# The Bald Dude Co. — Website

**thebalddude.co** | Brooklyn, NYC  
Cinematic street photography, events, portraits, and video production.

---

## File Structure

```
/
├── index.html          Homepage (loader, reel, packages, contact)
├── events.html         Events — 19 projects
├── portraits.html      Portraits — 21 projects
├── couples.html        Couples — 4 projects
├── street.html         Street — 9 projects
├── product.html        Product — 5 projects
└── README.md           This file
```

All project links point to **thebalddude.co** (Adobe Portfolio). Update your portfolio there whenever you want — the links in these files never need to change.

---

## Deployment — GitHub Pages

### Step 1 — Create the repository

Go to [github.com/new](https://github.com/new) and create a new repository.

**Naming options:**

| Repo name | Resulting URL |
|---|---|
| `thebalddudeco.github.io` | `https://thebalddudeco.github.io` |
| anything else (e.g. `site`) | `https://thebalddudeco.github.io/site` |

For a custom domain, the repo name doesn't matter — use whatever you want.  
Set visibility to **Public**. Don't initialize with a README (you already have one).

---

### Step 2 — Upload the files

**Option A — GitHub web interface (no command line)**

1. Open your new repo on GitHub
2. Click **Add file → Upload files**
3. Drag all 6 HTML files + README.md into the window
4. Click **Commit changes**

**Option B — Git command line**

```bash
git clone https://github.com/thebalddudeco/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
cp /path/to/files/*.html .
cp /path/to/files/README.md .
git add .
git commit -m "Initial site deploy"
git push origin main
```

---

### Step 3 — Enable GitHub Pages

1. In your repo, go to **Settings → Pages**
2. Under **Source**, select **Deploy from a branch**
3. Set branch to `main`, folder to `/ (root)`
4. Click **Save**

GitHub will give you a URL like `https://thebalddudeco.github.io` within 1–2 minutes.

---

### Step 4 — Connect your custom domain (thebalddude.co)

**In GitHub:**

1. Go to **Settings → Pages → Custom domain**
2. Enter `thebalddude.co`
3. Click **Save** — GitHub will create a `CNAME` file in your repo automatically
4. Check **Enforce HTTPS** (may take a few minutes to activate)

**In your domain registrar (wherever thebalddude.co is registered):**

Add these DNS records:

```
Type    Name    Value
────────────────────────────────────────
A       @       185.199.108.153
A       @       185.199.109.153
A       @       185.199.110.153
A       @       185.199.111.153
CNAME   www     thebalddudeco.github.io
```

DNS propagation takes anywhere from a few minutes to 48 hours depending on your registrar. You can check status at [dnschecker.org](https://dnschecker.org).

---

## Updating Content

### Adding a new project to a category

Open the relevant HTML file (e.g. `events.html`) and add a new row to the `<ul class="wl">` list:

```html
<li>
  <a class="wi" href="https://thebalddude.co/YOUR-PROJECT-SLUG" target="_blank" rel="noopener">
    <span class="wi-num">20</span>
    <span class="wi-name">Your Project Name</span>
    <span class="wi-type">Category / Type</span>
    <span class="wi-year">2026</span>
    <span class="wi-arr">↗</span>
  </a>
</li>
```

Then update the project count in the page header:
```html
<div class="ph-meta">
  Brooklyn, NYC<br>
  2019 — Present<br>
  20 Projects   ← update this number
</div>
```

Commit and push — GitHub Pages deploys automatically within ~30 seconds.

### Updating contact info or packages

Everything is in `index.html`. Search for the section you need:
- `id="contact"` — email, phone, social links
- `id="packages"` — pricing and Gumroad links
- `id="about"` — bio text

### Swapping the reel video

The reel is embedded in `index.html`. Search for `reelIframe` or `reelVideo` and replace the `src` with your new YouTube embed URL or video file path.

---

## Adding Hover Videos to Category Pages

The category pages are built to support per-project hover videos (video plays full-bleed when you hover a project name, exactly like timflower.co.nz).

When you have video files ready, host them anywhere (GitHub repo, Cloudflare R2, your web host) and add this to the `<script>` block in the relevant page:

```javascript
// Add these lines with your actual video URLs
addWorkVideo('01', 'videos/events/nyfw_bts_reel.mp4');
addWorkVideo('02', 'videos/events/inside_nyfw_runway.mp4');
// etc.
```

The system is already wired — just drop in the URLs.

**Recommended video specs for web:**
- Format: MP4 (H.264) or WebM (VP9)
- Resolution: 1280×720 minimum
- No audio track (saves ~30% file size, audio isn't needed for background loops)
- Duration: 10–30 seconds looping
- File size: aim for under 10MB per clip

---

## Tech Stack

| Layer | Tool |
|---|---|
| Hosting | GitHub Pages (free) |
| Domain | Custom DNS → GitHub Pages |
| Fonts | Google Fonts (Open Sans + DM Mono) |
| Portfolio pages | Adobe Portfolio (thebalddude.co) |
| Video reel | YouTube embed (no controls) |
| No frameworks | Vanilla HTML / CSS / JS only |

---

## Contact

**Justin Von Braun**  
info@thebalddude.co  
+1 (646) 537-0107  
[@thebalddude.dng](https://instagram.com/thebalddude.dng)  
[@thebalddudefoto](https://youtube.com/@thebalddudefoto)

---

*©2013 The Bald Dude Co. All rights reserved.*
