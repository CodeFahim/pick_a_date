/* =========================================================
   For Nishi 💌  —  script.js
   Sections:
   1. Settings (EmailJS keys + all the texts)
   2. Small helpers (screens, mood, weather, saving)
   3. Characters (draws the cute SVG stickers)
   4. Screen 1 & 2: Intro + typing note
   5. Screen 3: The question (Yes / No logic)
   6. Party effects (confetti, floating hearts)
   7. Screens 4–7: Yes → Plan → Day → Final
   8. Emails (EmailJS)
   9. Secret reset 🌸
   10. Start the page
   ========================================================= */


/* ---------- 1. Settings ---------- */

// EmailJS keys (paste your IDs here)
const EMAIL = {
  publicKey: "-eiwuJ331XueXUTaV",
  serviceId: "service_cqjzihl",
  templateUpdate: "template_2zso8yh", // for "opened it" + "said no"
  templateYes: "template_9f2usur",       // for "SHE SAID YES"
};

// The little note that types itself
const NOTE_LINES = [
  "Hey Nishi 🙂",
  "Shotti bolte, I'm not great at saying this face to face…",
  "tai I did the totally normal thing",
  "and built an entire website instead. 😅",
  "Okay. Deep breath. Ektu bhoy lagche…",
  "Here goes… 🙈",
];

// What happens on each "No" press (1st press = first item, and so on)
const NO_STEPS = [
  { mood: "pout", text: "Wait… are you gonna say no? 🥺", friend: "bunny" },
  { mood: "pout", text: "", friend: "frog", dodges: 4 },  // button starts running away
  { mood: "sad",  text: "Please consider… I practiced this in the mirror 😢", friend: "cat" },
  { mood: "cry",  text: "I'll even give you the aloo from my kacchi 🥔🥹", friend: "heart", weather: "cloudy", sign: true },
  { mood: "cry",  text: "My cats are watching. Don't break their hearts too 🐱", friend: "flower", weather: "rain" },
  { mood: "cry",  text: "Last chance… after this I become Devdas 💔", weather: "gloomy", melt: true },
];
// After the last step, the next "No" is the final answer.

// What the speech bubble says while the No button runs away
const DODGE_LINES = [
  "Nope, this button's shy 🙈",
  "Too slow 😝",
  "Hehe, almost 🏃",
  "Okay okay… it's tired now 😮‍💨",
];

// Names used to save things in the browser
const SAVE_KEY = "forNishi_answer";
const VISITS_KEY = "forNishi_visits";

// Things that change while she uses the page
let noCount = 0;       // how many times she pressed No
let dodgesLeft = 0;    // how many more times the No button will run away
const plan = { type: "", emoji: "", day: "", time: "", note: "" };


/* ---------- 2. Small helpers ---------- */

// Short way to get an element by id
function $(id) {
  return document.getElementById(id);
}

// Random number between min and max
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// Wait for some milliseconds (used with "await")
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Show one screen and hide the others
function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $("screen-" + name).classList.add("active");
  window.scrollTo(0, 0);
}

// Change every character's face: "normal", "happy", "pout", "sad", "cry"
function setMood(mood) {
  document.body.dataset.mood = mood;
}

// Change the weather: "clear", "cloudy", "rain", "gloomy"
function setWeather(weather) {
  document.body.dataset.weather = weather;
  $("cloud").textContent = weather === "cloudy" ? "☁️" : "🌧️";
  $("rain").innerHTML = "";
  if (weather === "rain" || weather === "gloomy") makeRain();
}

// Make rain drops fall across the screen
function makeRain() {
  for (let i = 0; i < 50; i++) {
    const drop = document.createElement("span");
    drop.className = "drop";
    drop.style.left = random(0, 100) + "vw";
    drop.style.animationDuration = random(0.6, 1.2) + "s";
    drop.style.animationDelay = random(0, 2) + "s";
    $("rain").appendChild(drop);
  }
}

// Pop in a sticker friend
function showFriend(name) {
  $("friend-" + name).classList.add("show");
}

function showAllFriends() {
  ["bunny", "cat", "frog", "heart"].forEach(showFriend);
}

// Save / load from the browser (wrapped in try so it never crashes)
function readStorage(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}
function saveAnswer(data) {
  writeStorage(SAVE_KEY, JSON.stringify(data));
}
function loadAnswer() {
  try { return JSON.parse(readStorage(SAVE_KEY)); } catch (e) { return null; }
}

// Today's date as "2026-10-18" (for the date picker)
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + month + "-" + day;
}

// "2026-10-18"  ->  "Sat, 18 Oct"
function prettyDate(value) {
  const d = new Date(value + "T00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}


/* ---------- 3. Characters ---------- */

// The face is the same for every character.
// It has all the eyes/mouths; CSS shows only the ones for the current mood.
const FACE = `
  <g class="eyes eyes-open" fill="#4A2C3A">
    <circle cx="44" cy="64" r="5.5"/><circle cx="76" cy="64" r="5.5"/>
    <circle cx="46" cy="62" r="1.8" fill="#fff"/><circle cx="78" cy="62" r="1.8" fill="#fff"/>
  </g>
  <g class="eyes eyes-happy" fill="none" stroke="#4A2C3A" stroke-width="3.5" stroke-linecap="round">
    <path d="M38 66 q6 -9 12 0"/><path d="M70 66 q6 -9 12 0"/>
  </g>
  <g class="eyes eyes-sad">
    <circle cx="44" cy="65" r="5.5" fill="#4A2C3A"/><circle cx="76" cy="65" r="5.5" fill="#4A2C3A"/>
    <circle cx="46" cy="63" r="2.4" fill="#fff"/><circle cx="78" cy="63" r="2.4" fill="#fff"/>
    <path d="M36 55 L50 51 M84 55 L70 51" stroke="#4A2C3A" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="eyes eyes-cry" fill="none" stroke="#4A2C3A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M38 60 l10 5 l-10 5"/><path d="M82 60 l-10 5 l10 5"/>
  </g>

  <ellipse cx="33" cy="78" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.6"/>
  <ellipse cx="87" cy="78" rx="7" ry="4.5" fill="#FF8FA3" opacity="0.6"/>

  <path class="mouth m-smile" d="M52 80 q8 8 16 0" fill="none" stroke="#4A2C3A" stroke-width="3.5" stroke-linecap="round"/>
  <path class="mouth m-big"   d="M47 78 q13 20 26 0 z" fill="#C2405E" stroke="#4A2C3A" stroke-width="3" stroke-linejoin="round"/>
  <path class="mouth m-pout"  d="M53 86 q3.5 -4 7 0 q3.5 4 7 0" fill="none" stroke="#4A2C3A" stroke-width="3" stroke-linecap="round"/>
  <path class="mouth m-sad"   d="M52 89 q8 -8 16 0" fill="none" stroke="#4A2C3A" stroke-width="3.5" stroke-linecap="round"/>
  <ellipse class="mouth m-cry" cx="60" cy="88" rx="8" ry="6.5" fill="#C2405E" stroke="#4A2C3A" stroke-width="3"/>

  <path class="tears tear-one" d="M77 72 q-4.5 7 0 10 q4.5 -3 0 -10z" fill="#7EC8E3"/>
  <g class="tears tears-stream" fill="#7EC8E3">
    <path d="M42 70 q-5 8 0 12 q5 -4 0 -12z"/>
    <path d="M78 70 q-5 8 0 12 q5 -4 0 -12z"/>
  </g>
`;

// Body color + ears/extras for each character
function makeCharacter(type) {
  const line = 'stroke="#4A2C3A" stroke-width="3" stroke-linejoin="round"';
  let extras = "";
  let head = "";

  if (type === "blob") {
    extras = `<path d="M60 32 q4 -16 18 -16 q-2 14 -18 16z" fill="#A8C3A0" ${line}/>`;
    head = `<ellipse cx="60" cy="72" rx="46" ry="40" fill="#FFB4A2" ${line}/>`;
  }
  if (type === "bunny") {
    extras = `<ellipse cx="42" cy="24" rx="10" ry="24" fill="#fff" ${line}/>
              <ellipse cx="78" cy="24" rx="10" ry="24" fill="#fff" ${line}/>
              <ellipse cx="42" cy="26" rx="4" ry="15" fill="#FFC6D0"/>
              <ellipse cx="78" cy="26" rx="4" ry="15" fill="#FFC6D0"/>`;
    head = `<ellipse cx="60" cy="72" rx="44" ry="38" fill="#fff" ${line}/>`;
  }
  if (type === "cat") {
    extras = `<polygon points="20,48 28,12 54,34" fill="#F6D6AD" ${line}/>
              <polygon points="100,48 92,12 66,34" fill="#F6D6AD" ${line}/>`;
    head = `<ellipse cx="60" cy="72" rx="46" ry="38" fill="#F6D6AD" ${line}/>`;
  }
  if (type === "frog") {
    extras = `<circle cx="36" cy="40" r="16" fill="#A8D5A2" ${line}/>
              <circle cx="84" cy="40" r="16" fill="#A8D5A2" ${line}/>`;
    head = `<ellipse cx="60" cy="74" rx="48" ry="36" fill="#A8D5A2" ${line}/>`;
  }
  if (type === "heart") {
    head = `<path d="M60 112 C20 86 6 60 20 40 C32 24 52 26 60 42 C68 26 88 24 100 40 C114 60 100 86 60 112Z" fill="#FF9EB1" ${line}/>`;
  }

  return `<svg class="char" viewBox="0 0 120 120" aria-hidden="true">${extras}${head}${FACE}</svg>`;
}

// Put a character inside every element that has data-char="..."
function drawAllCharacters() {
  document.querySelectorAll("[data-char]").forEach((el) => {
    el.insertAdjacentHTML("afterbegin", makeCharacter(el.dataset.char));
  });
}


/* ---------- 4. Screen 1 & 2: Intro + typing note ---------- */

$("envelope").addEventListener("click", () => {
  $("envelope").classList.add("open");
  setTimeout(() => {
    showScreen("note");
    typeNote();
  }, 1200);
}, { once: true });

let skipTyping = false;

// Types the note one letter at a time
async function typeNote() {
  for (const line of NOTE_LINES) {
    const p = document.createElement("p");
    $("note-text").appendChild(p);

    // Array.from keeps emojis in one piece
    for (const letter of Array.from(line)) {
      p.textContent += letter;
      if (!skipTyping) await sleep(40);
    }
    if (!skipTyping) await sleep(450);
  }
  $("note-next").classList.add("show");
}

// Tapping the note skips the typing
$("screen-note").addEventListener("click", () => {
  skipTyping = true;
});

$("note-next").addEventListener("click", () => {
  showScreen("question");
});


/* ---------- 5. Screen 3: The question ---------- */

const yesBtn = $("yes-btn");
const noBtn = $("no-btn");
const bubble = $("bubble");

// Change the speech bubble text with a little pop
function say(text) {
  bubble.textContent = text;
  bubble.classList.remove("pop");
  void bubble.offsetWidth; // restarts the animation
  bubble.classList.add("pop");
}

// Yes gets bigger, No gets smaller with every "No"
function resizeButtons() {
  yesBtn.style.fontSize = (1.1 + noCount * 0.15) + "rem";
  noBtn.style.fontSize = Math.max(0.75, 1.1 - noCount * 0.06) + "rem";
}

noBtn.addEventListener("click", () => {
  // While running away, a tap just makes it run again
  if (dodgesLeft > 0) {
    dodge();
    return;
  }

  noCount++;

  // No more steps left -> final answer is No
  if (noCount > NO_STEPS.length) {
    finalNo();
    return;
  }

  const step = NO_STEPS[noCount - 1];
  setMood(step.mood);
  if (step.text) say(step.text);
  if (step.friend) showFriend(step.friend);
  if (step.weather) setWeather(step.weather);
  if (step.sign) $("friend-bunny").classList.add("holding-sign");
  if (step.melt) document.body.classList.add("melting");
  resizeButtons();

  if (step.dodges) {
    dodgesLeft = step.dodges;
    dodge();
  }
});

// On a laptop, it runs away as soon as the mouse gets close
// (only for a real mouse, so a phone tap doesn't count twice)
noBtn.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "mouse" && dodgesLeft > 0) dodge();
});

// No button runs away (or gives up when tired)
function dodge() {
  say(DODGE_LINES[DODGE_LINES.length - dodgesLeft]);
  dodgesLeft--;

  if (dodgesLeft === 0) {
    // Tired: go back to its normal place and stay still
    noBtn.classList.remove("running");
    noBtn.style.left = "";
    noBtn.style.top = "";
    return;
  }
  moveNoButton();
}

// Moves the No button to a random spot (not on top of Yes)
function moveNoButton() {
  noBtn.classList.add("running");
  const pad = 16;
  const w = noBtn.offsetWidth;
  const h = noBtn.offsetHeight;
  const yes = yesBtn.getBoundingClientRect();

  let x, y, onTopOfYes;
  let tries = 0;
  do {
    x = random(pad, window.innerWidth - w - pad);
    y = random(pad, window.innerHeight - h - pad);
    onTopOfYes = x < yes.right + 10 && x + w > yes.left - 10 &&
                 y < yes.bottom + 10 && y + h > yes.top - 10;
    tries++;
  } while (onTopOfYes && tries < 20);

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

// Final "No": kind ending
function finalNo() {
  setMood("normal");
  setWeather("clear");
  document.body.classList.remove("melting");
  document.body.classList.add("waving");
  showAllFriends();
  showScreen("no");

  saveAnswer({ answer: "no", noCount: noCount });
  sendEmail(EMAIL.templateUpdate, {
    emoji: "🙂",
    title: "Nishi said no",
    message: "She pressed No " + noCount + " times. Still proud of you for asking 🫶",
  });
}

yesBtn.addEventListener("click", () => {
  startPartyMode();
  showScreen("yes");
  startParty();
});


/* ---------- 6. Party effects ---------- */

// Everyone becomes happy and dances
function startPartyMode() {
  setMood("happy");
  setWeather("clear");
  document.body.classList.remove("melting", "waving");
  document.body.classList.add("party");
  showAllFriends();

  // The bunny's sign and the flower cheer up too
  $("bunny-sign").textContent = "yay! 🎉";
  $("friend-bunny").classList.add("holding-sign");
  $("friend-flower").textContent = "🌷";
}

// Confetti from both bottom corners
function confettiBurst() {
  if (!window.confetti) return; // if the library didn't load, skip
  const colors = ["#E8798F", "#FFC6A8", "#A8C3A0", "#FFE29A", "#FFFFFF"];
  confetti({ particleCount: 90, angle: 60,  spread: 65, origin: { x: 0, y: 0.9 }, colors: colors });
  confetti({ particleCount: 90, angle: 120, spread: 65, origin: { x: 1, y: 0.9 }, colors: colors });
}

// Hearts, balloons and sparkles floating up
function spawnFloaters(emojis, count) {
  for (let i = 0; i < count; i++) {
    const f = document.createElement("span");
    f.className = "floater";
    f.textContent = emojis[i % emojis.length];
    f.style.left = random(0, 92) + "vw";
    f.style.fontSize = random(18, 40) + "px";
    f.style.animationDuration = random(4, 8) + "s";
    f.style.animationDelay = random(0, 1.5) + "s";
    f.addEventListener("animationend", () => f.remove());
    $("floaters").appendChild(f);
  }
}

function startParty() {
  confettiBurst();
  setTimeout(confettiBurst, 700);
  setTimeout(confettiBurst, 1400);
  spawnFloaters(["💖", "💕", "🎈", "✨", "💗", "🎉"], 28);
}

// On the Yes screen: tap anywhere for more confetti
document.addEventListener("click", (e) => {
  if (!$("screen-yes").classList.contains("active")) return;
  if (e.target.closest("button")) return;
  if (window.confetti) {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
    });
  }
  spawnFloaters(["💖", "✨"], 4);
});


/* ---------- 7. Screens 4–7: Plan → Day → Final ---------- */

$("plan-btn").addEventListener("click", () => {
  showScreen("plan");
});

// Pick the date type
let picking = false;
document.querySelectorAll(".option").forEach((option) => {
  option.addEventListener("click", () => {
    if (picking) return; // stops double taps
    picking = true;

    document.querySelectorAll(".option").forEach((o) => o.classList.remove("picked"));
    option.classList.add("picked");
    plan.type = option.dataset.type;
    plan.emoji = option.dataset.emoji;
    spawnFloaters([plan.emoji], 8);

    setTimeout(() => {
      picking = false;
      showScreen("day");
    }, 900);
  });
});

// Day screen
const dateInput = $("date-input");
dateInput.min = todayString();

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    plan.time = chip.dataset.time;
    checkReady();
  });
});

dateInput.addEventListener("input", checkReady);
dateInput.addEventListener("change", checkReady);

// Button works only when a day AND a time are picked
function checkReady() {
  $("day-hint").textContent = "";
  $("confirm-btn").disabled = !(dateInput.value && plan.time);
}

$("back-btn").addEventListener("click", () => {
  document.querySelectorAll(".option").forEach((o) => o.classList.remove("picked"));
  showScreen("plan");
});

$("confirm-btn").addEventListener("click", () => {
  if (dateInput.value < todayString()) {
    $("day-hint").textContent = "That day already passed 😅 pick another one";
    return;
  }
  $("confirm-btn").disabled = true; // stops double taps

  plan.day = prettyDate(dateInput.value);
  plan.note = $("note-input").value.trim();

  const answer = {
    answer: "yes",
    type: plan.type,
    emoji: plan.emoji,
    day: plan.day,
    time: plan.time,
    note: plan.note,
    noCount: noCount,
  };
  saveAnswer(answer);

  let noText = "She said yes right away 😳";
  if (noCount === 1) noText = "She pressed No once first 😄";
  if (noCount > 1) noText = "She pressed No " + noCount + " times first 😄";

  sendEmail(EMAIL.templateYes, {
    date_type: plan.emoji + " " + plan.type,
    date_day: plan.day,
    date_time: plan.time,
    her_note: plan.note || "(no note)",
    no_count: noText,
  });

  showFinal(answer);
  startParty();
});

// Fill in the final summary card
function showFinal(answer) {
  $("sum-type").textContent = answer.emoji + " " + answer.type;
  $("sum-day").textContent = answer.day;
  $("sum-time").textContent = answer.time;
  $("sum-note").textContent = answer.note;
  $("sum-note-row").style.display = answer.note ? "" : "none";
  showScreen("final");
}


/* ---------- 8. Emails (EmailJS) ---------- */

function sendEmail(templateId, params, triesLeft = 2) {
  // Not set up yet? Just log it.
  if (EMAIL.serviceId.startsWith("PASTE") || templateId.startsWith("PASTE")) {
    console.log("📧 Email not set up yet. Would send:", params);
    return;
  }

  params.time = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    dateStyle: "medium",
    timeStyle: "short",
  });

  fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EMAIL.serviceId,
      template_id: templateId,
      user_id: EMAIL.publicKey,
      template_params: params,
    }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Email failed: " + res.status);
    })
    .catch((err) => {
      // Try one more time after 2 seconds
      if (triesLeft > 1) {
        setTimeout(() => sendEmail(templateId, params, triesLeft - 1), 2000);
      } else {
        console.warn(err);
      }
    });
}

// Tells you she opened the page
function sendOpenedEmail(saved) {
  const visits = Number(readStorage(VISITS_KEY) || 0) + 1;
  writeStorage(VISITS_KEY, visits);

  let title = "Nishi just opened it!";
  if (visits > 1) title = "Nishi opened it again (visit #" + visits + ")";

  let message = "Fingers crossed 🤞";
  if (saved && saved.answer === "yes") message = "She already said YES 💖 Probably checking the plan again.";
  if (saved && saved.answer === "no") message = "She already answered earlier.";

  sendEmail(EMAIL.templateUpdate, { emoji: "👀", title: title, message: message });
}


/* ---------- 9. Secret reset 🌸 ---------- */
// Tap the tiny flower (bottom-right) 7 times quickly -> reset button appears.

let flowerTaps = 0;
let lastTap = 0;

$("secret-flower").addEventListener("click", () => {
  const now = Date.now();
  if (now - lastTap > 1500) flowerTaps = 0; // too slow, start counting again
  lastTap = now;
  flowerTaps++;

  if (flowerTaps >= 7) {
    flowerTaps = 0;
    $("reset-box").hidden = false;
  }
});

$("reset-yes").addEventListener("click", () => {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(VISITS_KEY);
  } catch (e) { /* ignore */ }
  location.reload();
});

$("reset-cancel").addEventListener("click", () => {
  $("reset-box").hidden = true;
});


/* ---------- 10. Start the page ---------- */

function start() {
  drawAllCharacters();
  setMood("normal");
  setWeather("clear");

  const saved = loadAnswer();
  sendOpenedEmail(saved);

  if (saved && saved.answer === "yes") {
    // She already said yes before -> show the plan again
    startPartyMode();
    showFinal(saved);
    confettiBurst();
  } else if (saved && saved.answer === "no") {
    document.body.classList.add("waving");
    showAllFriends();
    showScreen("no");
  } else {
    showScreen("intro");
  }
}

start();
