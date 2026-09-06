# For Anjali 💜 — a small purple world

A 16-chapter, handmade birthday website. Pure HTML / CSS / vanilla JavaScript — no build step, no frameworks, no dependencies.

```
index.html  →  birthday  →  garden  →  drawing  →  origin  →  five-years  →  reels  →  photo-album
→  distance  →  letter  →  favorites  →  wishes  →  memory  →  someday  →  gift  →  final.html
```

---

## 1. Run it locally

Because the site loads fonts, music and images from files, open it through a tiny local server (not by double-clicking `index.html`):

```bash
# Python (already on most computers)
cd path/to/this/folder
python3 -m http.server 8000
# then open  http://localhost:8000
```

or with Node: `npx serve .` — or use the VS Code "Live Server" extension.

**To put it online:** upload the whole folder to Netlify Drop, Vercel, GitHub Pages, or any static host. A `netlify.toml` is included so Netlify serves the pages exactly as written. The site also works with "pretty URLs" (`/birthday` instead of `/birthday.html`) automatically.

> Tip: send her the link to `index.html` (the envelope). The story only works in order.

---

## 2. Where to put your images

Drop files into these folders **with exactly these names** and they appear automatically. If a file is missing, an elegant lavender placeholder is shown instead — never a broken-image icon.

```
images/
  bts/        bts-01.jpg  bts-02.jpg  bts-03.jpg  bts-04.jpg
  jungkook/   jungkook-01.jpg  jungkook-02.jpg  jungkook-03.jpg
  concert/    bts-concert-poster.jpg  concert-01.jpg  concert-02.jpg
  memories/   reel-01.jpg … reel-06.jpg   (or .mp4 clips — see below)
  decorations/ flower-01.svg flower-02.svg star.svg   (spare doodles, optional)
music/
  birthday.mp3          background loop
  happy-birthday.mp3    plays once when all candles are out
```

**Filenames are forgiving:** `bts-01.jpg`, `bts-01.JPG`, `bts-01.jpeg`, `bts-01.png` and `bts-01.webp` are all found automatically — only the *name part* (`bts-01`) must match. Just avoid spaces and put the files in the right folder.

**Photos not showing after you deploy?** Check, in order:
1. The files are actually in the deployed folder (`images/bts/…`) — if you drag-and-drop to Netlify, drag the *whole project folder* including `images/`.
2. The name matches an entry in `js/config.js` (e.g. `bts-05.jpg` needs a `"images/bts/bts-05.jpg"` line).
3. Hard-refresh the page (Ctrl/Cmd + Shift + R) — hosts cache images for a while.

Recommended sizes: BTS / Jungkook photos ≈ 800×1000 px (portrait), concert poster ≈ 800×1200 px, reel thumbnails ≈ 720×1120 px (9:14). Keep each under ~400 KB so the page stays light.

### Add MORE BTS or Jungkook photos
Open `js/config.js` and add lines to the list — that's it:

```js
btsImages: [
  "images/bts/bts-01.jpg",
  "images/bts/bts-02.jpg",
  "images/bts/bts-03.jpg",
  "images/bts/bts-04.jpg",
  "images/bts/bts-05.jpg",   // ← new
],
```

Same for `jungkookImages` and `concertImages`.

### Reels (page 07)
Each reel card is one entry in `birthdayConfig.reels`. `media` may be an image **or a short .mp4** (it plays muted on loop):

```js
{ media: "images/memories/reel-01.mp4", caption: "This is literally you 😂",
  react: "😂", date: "some random Tuesday", note: "I laughed for a solid minute." }
```

---

## 3. Music

Replace `music/birthday.mp3` with any soft track (keep the filename, or change `music:` in `js/config.js`).
The included file is a gentle generated piano-box loop so the site works out of the box.

- Music never autoplays — it starts on her first tap (**"I Promise 🤞"**) and can be toggled with the 🔊 / 🔇 button top-right (with a volume slider).
- The music **carries on seamlessly between chapters** (position is remembered as she moves page to page).
- When the last candle goes out, the background music dips, `music/happy-birthday.mp3` plays once (a music-box rendition included), then the music comes back. Swap in your own version by keeping the filename or changing `birthdaySong` in `js/config.js`.
- Default loudness: `musicVolume: 0.35` in `js/config.js`.

---

## 4. Editing the words

| What | Where |
|---|---|
| Her name, years, concert date | `js/config.js` |
| The 8 garden flower messages | `js/config.js → gardenMessages` |
| The letter | `letter.html` — each `<p>` is one handwritten line. `class="gap"` adds a blank line, `class="emph"` makes it purple/bold |
| Timeline text | `origin.html` |
| Scattered notes | `five-years.html` |
| Wishes (6 flowers) | `wishes.html` → the `wishes` array at the bottom |
| Gift joke | `gift.html` |
| Celebration lines & P.S. note | `final.html` |
| Button labels ("Turn the Page →" etc.) | the `<a class="btn nav-next">` in each page |

Everything is plain text in the HTML — search for the sentence and change it.

---

## 5. Changing colours

All colours live at the top of `css/style.css`:

```css
:root {
  --deep: #150d22;   --plum: #24163a;   --violet: #5a3a8c;  --violet-2: #7452a8;
  --mauve: #a57fb4;  --orchid: #c48ad6; --lavender: #bda6e6; --lilac: #dccbf2;
  --cream: #f7f0e6;  --ivory: #fcf9f3;  --gold: #d6b97c;    --gold-2: #f0dfb0;
  --ink: #372552;    --ink-soft: #6b5a86;
}
```

Change a variable and it updates everywhere (buttons, flowers, curtains, cake, ribbons…).

Fonts are bundled locally in `assets/fonts/` (Cormorant Garamond for headings, Nunito for body, Caveat + Dancing Script for handwriting — all OFL-licensed). To swap the handwriting, edit `--font-hand` / `--font-script` in `style.css`.

---

## 6. The finale (page 16)

- **Open the Curtains 🎀** → curtains part to reveal the cake.
- **Candles:** tap/click each flame (keyboard works too: Tab + Enter).
- All five out → the Happy Birthday song plays, confetti, celebration lines, then the page calms down into the P.S. note.

---

## 7. Accessibility & motion

- Semantic HTML, keyboard navigation (← / → also move between chapters), visible focus rings, `aria-live` for flower messages, alt text on your images.
- `prefers-reduced-motion: reduce` shortens every animation and removes ambient movement while keeping the story intact.

---

## 8. File map

```
index.html … final.html   16 chapters
css/fonts.css             local @font-face rules
css/style.css             design system + every chapter's styles
js/config.js              ← the only file you *need* to edit
js/navigation.js          chapter counter, page-veil transitions, timed & scroll reveals
js/script.js              music player, image placeholders, starry-sky canvas, doodle library
js/animations.js          stroke-by-stroke drawing, confetti, sparkles, drifting petals
assets/fonts/             bundled webfonts
images/, music/           your media (see above)
```

Made with an unreasonable amount of care. 💜
