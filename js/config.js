/* ============================================================
   birthdayConfig — the one place you edit to customise things.
   Every page reads from this object.
   ============================================================ */
const birthdayConfig = {
  name: "Anjali",

  // Background music (soft & atmospheric). Only starts after the first tap/click.
  music: "music/birthday.mp3",
  musicVolume: 0.35,          // 0 – 1
  letterVolume: 0.15,         // (unused now — music keeps playing on the letter page)
  birthdaySong: "music/happy-birthday.mp3",   // plays once when all candles are blown out

  // How many years you've known each other (used in a few small places)
  years: "5+",

  // ---- Her little universe -----------------------------------
  // Drop your own legally-obtained images into these folders.
  // Missing files show an elegant placeholder, never a broken icon.
  btsImages: [
    "images/bts/bts-01.jpg",
    "images/bts/bts-02.jpg",
    "images/bts/bts-03.jpg",
    "images/bts/bts-04.jpg"
  ],
  jungkookImages: [
    "images/jungkook/jungkook-01.jpg",
    "images/jungkook/jungkook-02.jpg",
    "images/jungkook/jungkook-03.jpg"
  ],
  concertPoster: "images/concert/bts-concert-poster.jpg",
  concertImages: [
    "images/concert/concert-01.jpg",
    "images/concert/concert-02.jpg"
  ],
  concertDate: "February 2027",
  concertLine: "A concert she'll probably remember for a very, very long time.",

  // ---- The reel corner ---------------------------------------
  // media can be a .jpg/.png (thumbnail) or an .mp4 (short clip).
  reels: [
    { media: "images/memories/reel-01.jpg", caption: "This is literally you 😂", react: "😂", date: "some random Tuesday", note: "I laughed for a solid minute." },
    { media: "images/memories/reel-02.jpg", caption: "Don't ask why I sent this.", react: "💀", date: "3:12 am, obviously", note: "no context. never any context." },
    { media: "images/memories/reel-03.jpg", caption: "Okay but this was actually funny.", react: "🤝", date: "a while ago", note: "you replied 😂 — a classic." },
    { media: "images/memories/reel-04.jpg", caption: "I saw this and immediately thought of you.", react: "💜", date: "more than once", note: "this happens a lot, honestly." },
    { media: "images/memories/reel-05.jpg", caption: "Sending this instead of a good morning.", react: "🌷", date: "most mornings", note: "our love language, apparently." },
    { media: "images/memories/reel-06.jpg", caption: "Watch till the end.", react: "👀", date: "you never do", note: "you never watch till the end." }
  ],

  // ---- Garden messages (page 03) — one per flower --------------
  gardenMessages: [
    "For all the times you made me laugh.",
    "For every random conversation.",
    "For every ridiculous reel.",
    "For all the memories we somehow made without ever meeting.",
    "For checking in, even when we'd both gone quiet.",
    "For being the same person after five years. Somehow better, actually.",
    "For laughing at things that are not funny at all.",
    "For the friendship nobody planned — and I'd never trade."
  ],

  // ---- Chapter order (used for the 04 / 16 indicator & buttons) --
  chapters: [
    { file: "index.html",       label: "The Envelope" },
    { file: "birthday.html",    label: "Happy Birthday" },
    { file: "garden.html",      label: "The Purple Garden" },
    { file: "drawing.html",     label: "The Little Drawing" },
    { file: "origin.html",      label: "How It All Started" },
    { file: "five-years.html",  label: "Five Years of Little Things" },
    { file: "reels.html",       label: "The Reel Corner" },
    { file: "photo-album.html", label: "The Album We Don't Have Yet" },
    { file: "distance.html",    label: "Distance" },
    { file: "letter.html",      label: "The Letter" },
    { file: "favorites.html",   label: "Her Little Universe" },
    { file: "wishes.html",      label: "Things I Hope For You" },
    { file: "memory.html",      label: "The Memory That Isn't Here Yet" },
    { file: "someday.html",     label: "Someday" },
    { file: "gift.html",        label: "The Gift" },
    { file: "final.html",       label: "The Grand Finale" }
  ]
};
