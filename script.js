/* =========================================================
   EDIT HERE — date and dinner time (24h format "HH:MM")
   ========================================================= */
const CONFIG = {
  date: "2026-11-08",
  time: "19:30", // 7:30 PM (countdown uses 24h format)
};

/* Photos for the spinning gallery + the sentence under each one */
const PHOTOS = [
  { src: "images/web/1photo.jpg",  text: "The smile that stole my heart." },
  { src: "images/web/2photo.jpg",  text: "Every rose for you — and you still outshine them all." },
  { src: "images/web/3photo.jpg",  text: "The night you said yes, forever began." },
  { src: "images/web/4photo.jpg",  text: "You are my favourite sunset." },
  { src: "images/web/5photo.jpg",  text: "Side by side, always." },
  { src: "images/web/6photo.jpg",  text: "Under every sky, it’s always you." },
  { src: "images/web/7photo.jpg",  text: "With you, every moment is a celebration." },
  { src: "images/web/8photo.jpg",  text: "Celebrating you is my favourite tradition." },
  { src: "images/web/9photo.jpg",  text: "Sweet moments, sweeter with you." },
  { src: "images/web/10photo.jpg", text: "Hand in hand, all the way to forever." },
];

const pad = (n) => String(n).padStart(2, "0");
// Show the time as 12h (e.g. "7:30") — "PM" is written next to it in the page
const [h24, min] = CONFIG.time.split(":").map(Number);
document.querySelectorAll("[data-time]").forEach((el) => (el.textContent = `${h24 % 12 || 12}:${pad(min)}`));

/* ---------- Video intro ---------- */
const intro = document.getElementById("intro");
const video = document.getElementById("introVideo");
const song = document.getElementById("song");
const musicBtn = document.getElementById("musicBtn");
let opened = false;

intro.addEventListener("click", () => {
  if (intro.classList.contains("playing")) return;
  intro.classList.add("playing");

  // Unlock the song on phones (it must be touched by a tap first)
  song.muted = true;
  song.play().then(() => { song.pause(); song.muted = false; }).catch(() => { song.muted = false; });

  video.play().catch(openInvitation); // if the video can't play, just open
});

// Start fading the video just before it ends, then open the invitation
const FADE_BEFORE_END = 1.4; // seconds
video.addEventListener("timeupdate", () => {
  if (video.duration && video.duration - video.currentTime <= FADE_BEFORE_END) {
    intro.classList.add("fading");
  }
});
video.addEventListener("ended", () => {
  intro.classList.add("fading");
  setTimeout(openInvitation, 300);
});
video.addEventListener("error", () => { if (intro.classList.contains("playing")) openInvitation(); });

function openInvitation() {
  if (opened) return;
  opened = true;
  intro.classList.add("hide");
  document.body.classList.remove("locked");
  window.scrollTo(0, 0);
  startRoses();
  setTimeout(() => document.querySelector(".opening").classList.add("visible"), 400);

  song.currentTime = 0;
  song.play().catch(() => musicBtn.classList.add("paused"));
  musicBtn.classList.add("show");
}

/* ---------- Music button ---------- */
musicBtn.addEventListener("click", () => {
  if (song.paused) {
    song.play();
    musicBtn.classList.remove("paused");
    musicBtn.setAttribute("aria-label", "Pause music");
  } else {
    song.pause();
    musicBtn.classList.add("paused");
    musicBtn.setAttribute("aria-label", "Play music");
  }
});

// Add #open to the URL to skip the video (handy while editing)
if (location.hash === "#open") {
  opened = true;
  intro.classList.add("hide");
  document.body.classList.remove("locked");
  startRoses();
  musicBtn.classList.add("show", "paused");
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}

/* ---------- Falling roses ---------- */
const petalLayer = document.getElementById("petals");

function spawnRose() {
  const p = document.createElement("span");
  p.className = "petal";
  const duration = 10 + Math.random() * 8;
  p.style.left = Math.random() * 100 + "vw";
  p.style.setProperty("--s", 18 + Math.random() * 16 + "px");
  p.style.setProperty("--d", duration + "s");
  p.style.setProperty("--x", (Math.random() * 200 - 100) + "px");
  p.style.setProperty("--rot", (Math.random() * 80 - 40) + "deg");
  petalLayer.appendChild(p);
  setTimeout(() => p.remove(), duration * 1000);
}

function startRoses() {
  for (let i = 0; i < 10; i++) setTimeout(spawnRose, i * 300);
  setInterval(spawnRose, 1100);
}

/* ---------- Scroll reveal ---------- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
document.querySelectorAll(".reveal").forEach((el) => {
  if (!el.classList.contains("opening")) observer.observe(el);
});

/* ---------- Countdown ---------- */
const target = new Date(`${CONFIG.date}T${CONFIG.time}:00`).getTime();
const cd = {
  d: document.getElementById("cd-days"),
  h: document.getElementById("cd-hours"),
  m: document.getElementById("cd-mins"),
  s: document.getElementById("cd-secs"),
};

function tick() {
  const diff = target - Date.now();
  if (diff <= 0) {
    cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = "00";
    document.getElementById("cd-note").textContent = "Tonight is our night, my love";
    return;
  }
  cd.d.textContent = pad(Math.floor(diff / 86400000));
  cd.h.textContent = pad(Math.floor((diff / 3600000) % 24));
  cd.m.textContent = pad(Math.floor((diff / 60000) % 60));
  cd.s.textContent = pad(Math.floor((diff / 1000) % 60));
}
tick();
setInterval(tick, 1000);

/* ---------- 3D spinning photo gallery ---------- */
const stage = document.getElementById("spinStage");
const ring = document.getElementById("spinRing");
const caption = document.getElementById("spinCaption");
const counter = document.getElementById("spinCount");
const STEP = 360 / PHOTOS.length;
let pos = 0; // keeps counting so the ring can spin forever in both directions

const slides = PHOTOS.map((p, i) => {
  const s = document.createElement("div");
  s.className = "slide";
  s.style.setProperty("--i", i);
  s.innerHTML = `<img src="${p.src}" alt="" loading="${i < 3 ? "eager" : "lazy"}" />`;
  ring.appendChild(s);
  return s;
});

const current = () => ((pos % PHOTOS.length) + PHOTOS.length) % PHOTOS.length;

function goTo(newPos) {
  pos = newPos;
  ring.style.setProperty("--angle", `${-pos * STEP}deg`);
  const i = current();
  slides.forEach((s, k) => s.classList.toggle("active", k === i));
  counter.textContent = `${i + 1} / ${PHOTOS.length}`;

  caption.classList.add("out");
  setTimeout(() => {
    caption.textContent = PHOTOS[i].text;
    caption.classList.remove("out");
  }, 350);
}
goTo(0);

document.getElementById("spinNext").addEventListener("click", () => goTo(pos + 1));
document.getElementById("spinPrev").addEventListener("click", () => goTo(pos - 1));

// Swipe / drag
let startX = null;
let dragX = 0;

stage.addEventListener("pointerdown", (e) => {
  startX = e.clientX;
  dragX = 0;
  ring.classList.add("dragging");
  stage.setPointerCapture(e.pointerId);
});
stage.addEventListener("pointermove", (e) => {
  if (startX === null) return;
  dragX = e.clientX - startX;
  ring.style.setProperty("--angle", `${-pos * STEP + dragX * 0.25}deg`);
});
function endDrag() {
  if (startX === null) return;
  ring.classList.remove("dragging");
  startX = null;
  if (dragX < -40) goTo(pos + 1);       // slide left → next photo
  else if (dragX > 40) goTo(pos - 1);   // slide right → previous photo
  else goTo(pos);
}
stage.addEventListener("pointerup", endDrag);
stage.addEventListener("pointercancel", endDrag);

/* ---------- Love quotes carousel ---------- */
const quotes = [...document.querySelectorAll("#quotes blockquote")];
const dotsWrap = document.getElementById("quote-dots");
let qi = 0;
let qTimer;

quotes.forEach((_, i) => {
  const b = document.createElement("button");
  b.setAttribute("aria-label", `Quote ${i + 1}`);
  if (i === 0) b.classList.add("active");
  b.addEventListener("click", () => { showQuote(i); restartQuotes(); });
  dotsWrap.appendChild(b);
});
const dots = [...dotsWrap.children];

function showQuote(i) {
  quotes[qi].classList.remove("active");
  dots[qi].classList.remove("active");
  qi = i;
  quotes[qi].classList.add("active");
  dots[qi].classList.add("active");
}
function restartQuotes() {
  clearInterval(qTimer);
  qTimer = setInterval(() => showQuote((qi + 1) % quotes.length), 4500);
}
restartQuotes();

/* ---------- RSVP: "No" is not an option ---------- */
const noBtn = document.getElementById("no");
const yesBtn = document.getElementById("yes");
const rsvp = document.getElementById("rsvp");
const noTexts = ["No", "Are you sure?", "Think again ♥", "Pretty please?", "Not an option", "Try the other one"];
let noCount = 0;
let yesScale = 1;

function dodge(e) {
  e.preventDefault();
  noCount++;
  const x = (Math.random() * 2 - 1) * 110;
  const y = (Math.random() * 2 - 1) * 60;
  noBtn.style.transform = `translate(${x}px, ${y}px)`;
  noBtn.textContent = noTexts[noCount % noTexts.length];
  yesScale = Math.min(yesScale + 0.08, 1.5);
  yesBtn.style.transform = `scale(${yesScale})`;
}
noBtn.addEventListener("mouseenter", dodge);
noBtn.addEventListener("touchstart", dodge, { passive: false });
noBtn.addEventListener("click", dodge);

yesBtn.addEventListener("click", () => {
  rsvp.classList.add("answered");
  const r = rsvp.getBoundingClientRect();
  heartBurst(r.left + r.width / 2, r.top + r.height / 2, 30);
  for (let i = 0; i < 20; i++) setTimeout(spawnRose, i * 80);
});

/* ---------- Little hearts wherever she taps ---------- */
function heartBurst(x, y, count = 6) {
  const symbols = ["♥", "❤", "♡"];
  for (let i = 0; i < count; i++) {
    const h = document.createElement("span");
    h.className = "tap-heart";
    h.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    h.style.left = x + "px";
    h.style.top = y + "px";
    h.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
    h.style.setProperty("--dr", (Math.random() * 60 - 30) + "deg");
    h.style.setProperty("--fs", 12 + Math.random() * 18 + "px");
    h.style.color = Math.random() < 0.3 ? "#e8d3a0" : "#c4495f";
    h.style.animationDelay = Math.random() * 0.25 + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }
}

document.addEventListener("click", (e) => {
  if (e.target.closest("button, a, .spin-stage")) return;
  if (document.body.classList.contains("locked")) return;
  heartBurst(e.clientX, e.clientY, 5);
});
