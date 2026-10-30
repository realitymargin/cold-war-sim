# The Cold War, 1,000,000 times: run it yourself

The exact simulation from the RealityMargin video **"I Simulated the Cold War 1,000,000 Times"**, running in the browser.
Change the odds of any crisis, run a million Cold Wars, and share your scenario with a link.

**Open the simulator:** https://YOUR-USERNAME.github.io/cold-war-sim/ (replace with the real address once it's live)

## What's in this folder

| File | What it is |
|---|---|
| `index.html` | The simulator: guide, experiments, sliders, the run, results, all 51 forks, questions |
| `app.js` | The page's buttons and the run |
| `site.css` | The look of every page |
| `sim.js` | The model itself: version 4, locked 30 October 2026, line for line the video's model (download it from the code page) |
| `sim_web.js` | The same model with its export keywords removed, so it runs as a plain script |
| `odds.html` | Every odd in all three columns, and how many worlds each fork ends |
| `sources.html` | Why each odd is what it is, with sources, and how the model changed from version 1 to 4 |
| `code.html` | The model's code, readable, with a download button |
| `og.png` | The picture shown when the link is posted (YouTube, Discord, WhatsApp, X) |
| `.nojekyll` | Tells GitHub to serve every file exactly as it is. **Upload it too** (see step 3) |

The page also works when you just double-click `index.html` on your computer, so you can try it before uploading.

With nothing changed, the page reproduces the video exactly: 699,712 worlds survive, 228,235 end in nuclear war. Every experiment the video runs has its own card and reproduces too: Berlin becomes a war → 48,977; Kennedy strikes Cuba → 486,499; B-59 fires its torpedo → 243,701; Petrov reports it → 687,236; every alarm × 2 → 657,448; the slider test → 602,899; danger exaggerated → 94%; we got very lucky → 19%. All of this is checked automatically before release.

The page sends nothing anywhere. A shared link only carries the settings (for example `#c=1&a=1&e=petrov.pass:1`).

---

## Put it online with GitHub Pages (free, about 5 minutes)

### 1. Get a GitHub account
Go to **github.com** and sign up (free). The username becomes part of the address:
`https://USERNAME.github.io/cold-war-sim/`. A username like **realitymargin** gives the cleanest link: `realitymargin.github.io/cold-war-sim`.

### 2. Create the repository
1. Click **+** (top right) → **New repository**.
2. Repository name: **cold-war-sim**.
3. Choose **Public**. Leave everything else as it is.
4. Click **Create repository**.

### 3. Upload the files
1. On the new repository's page, click **uploading an existing file** (or **Add file → Upload files**).
2. Open this folder on your computer and drag **all the files** into the browser window.
   - `.nojekyll` is a hidden file. On Windows, in File Explorer, open **View → Show → Hidden items** so you can see and drag it. If it doesn't go up, the page still works; the odds and sources pages are HTML either way.
3. Scroll down and click **Commit changes**.

### 4. Switch on GitHub Pages
1. In the repository, click **Settings** (top bar) → **Pages** (left menu).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Branch: **main**, folder: **/ (root)**. Click **Save**.
4. Wait 1–2 minutes and refresh. The address appears at the top: **"Your site is live at https://USERNAME.github.io/cold-war-sim/"**.

### 5. Check it
Open the address, press **RUN**, and wait about 15 seconds (longer on a phone). It must say **699,712** survived. If it does, it's working.

### 6. Put the link in the video
Send the address to Claude, which fills it into the description and the pinned comment (`09_packaging/YOUTUBE_PACKAGE.md`, where it says `[LINK]`).

---

## Updating it later
Upload changed files the same way (**Add file → Upload files**, same names). The site updates within a minute or two.

## Future simulation videos
Make one repository per video (for example `ww2-sim`), the same way. Each gets its own address under the same username.
If you later buy your own domain (for example realitymargin.com, about $10–15 a year), every page can move under it in **Settings → Pages → Custom domain** without changing anything else.
