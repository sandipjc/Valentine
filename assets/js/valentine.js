

/* ========== ELEMENTS ========== */
let selectedName = "";
const noBtn = document.getElementById("noBtn");
const anchor = document.getElementById("noAnchor");
const yesBtn = document.getElementById("yesBtn");
const nameInput = document.getElementById("girlName");

const generateLinkBtn = document.getElementById("generateLinkBtn");
const shareBox = document.getElementById("shareBox");
const shareLink = document.getElementById("shareLink");
const titleText = document.getElementById("titleText");
const nativeShareBtn = document.getElementById("nativeShareBtn");

/* ========== PHYSICS VALUES ========== */
let pos = { x: 0, y: 0 };
let vel = { x: 0, y: 0 };

const speed = 0.18;
const friction = 0.85;
const SAFE_RADIUS = 260;
const EDGE_PADDING = 40;

/* ========== HELPERS ========== */
function toSlug(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

function fromSlug(slug) {
    return slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
}

function vibrateTiny() {
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isAndroid && "vibrate" in navigator) {
        navigator.vibrate([20, 30, 20]);
    }
}
const escapeSound = document.getElementById("escapeSound");

function playEscapeSound() {
    if (!escapeSound) return;
    escapeSound.currentTime = 0;
    escapeSound.volume = 0.3;
    escapeSound.play().catch(() => {});
}

function launchConfetti() {
    for (let i = 0; i < 80; i++) {
        const conf = document.createElement("div");
        conf.style.position = "fixed";
        conf.style.width = "8px";
        conf.style.height = "8px";
        conf.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
        conf.style.left = Math.random() * 100 + "vw";
        conf.style.top = "-10px";
        conf.style.borderRadius = "50%";
        conf.style.pointerEvents = "none";
        conf.style.zIndex = "9999";

        document.body.appendChild(conf);

        const fall = conf.animate([
            { transform: "translateY(0)" },
            { transform: `translateY(${window.innerHeight + 20}px)` }
        ], {
            duration: 2000 + Math.random() * 1000,
            easing: "ease-out"
        });

        fall.onfinish = () => conf.remove();
    }
}
/* ========== PLACE NO NEXT TO YES ========== */
function placeNo() {
    const r = anchor.getBoundingClientRect();
    pos.x = r.left + 10;
    pos.y = r.top;
    updatePosition();
}

function updatePosition() {
    noBtn.style.left = pos.x + "px";
    noBtn.style.top = pos.y + "px";
}

/* ========== ANIMATION LOOP ========== */
function animate() {
    pos.x += vel.x;
    pos.y += vel.y;

    vel.x *= friction;
    vel.y *= friction;

    const w = noBtn.offsetWidth;
    const h = noBtn.offsetHeight;

    const minX = EDGE_PADDING;
    const minY = EDGE_PADDING;
    const maxX = window.innerWidth - w - EDGE_PADDING;
    const maxY = window.innerHeight - h - EDGE_PADDING;

    if (pos.x <= minX || pos.x >= maxX) vel.x *= -1;
    if (pos.y <= minY || pos.y >= maxY) vel.y *= -1;

    pos.x = Math.max(minX, Math.min(maxX, pos.x));
    pos.y = Math.max(minY, Math.min(maxY, pos.y));

    updatePosition();
    requestAnimationFrame(animate);
}

/* ========== REPEL LOGIC ========== */
function repel(e) {
    const rect = noBtn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = cx - e.clientX;
    const dy = cy - e.clientY;

    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    if (dist > SAFE_RADIUS) return;

    const force = Math.min(45, (SAFE_RADIUS / dist) * 7);

    vel.x += (dx / dist) * force * speed;
    vel.y += (dy / dist) * force * speed;

    //  sound on escape Android
    playEscapeSound();
}

/* ========== EVENTS ========== */
document.addEventListener("mousemove", repel);
noBtn.addEventListener("touchstart", e => {
    e.preventDefault();
    vibrateTiny();        // 📳 User gesture = vibration allowed
    repel(e.touches[0]);
});
noBtn.addEventListener("click", repel);

/* ========== PHASE 1: GENERATE LINK ========== */
generateLinkBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) {
        alert("Enter her name first ❤️");
        return;
    }

    const slug = toSlug(name);
    const baseURL = window.location.origin + window.location.pathname;
    const url = `${baseURL}?name=${slug}`;

    // Show it on screen
    shareLink.value = url;
    shareLink.style.display = "block";
    shareBox.style.display = "block";
    //const titleInfoText = document.getElementById("titleInfoText").style.display = "none";
    titleInfoText.innerText = `Link copied! You can also tap Share ❤️`;
    try {
        await navigator.clipboard.writeText(url);
        shareBox.innerText = "Link copied! You can also tap Share ❤️";
    } catch {
        shareBox.innerText = "Long-press the link to copy ❤️";
    }

    // Show native share if supported
    if (navigator.share) {
        nativeShareBtn.style.display = "inline-block";
    }
});
nativeShareBtn.addEventListener("click", async () => {
    const url = shareLink.value;
    if (!url) return;

    try {
        await navigator.share({
            title: "Someone made this just for you ❤️",
            text: "Tap this - I have something special for you 💌",
            url
        });
    } catch (err) {
        // User cancelled or browser blocked
    }
});
/* ========== PHASE 2: CHECK SHARED LINK ========== */
function checkPhase() {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");

    if (name) {
        const decoded = fromSlug(name);

        nameInput.value = decoded;
        yesBtn.disabled = false;
        yesBtn.classList.add("enabled");

        generateLinkBtn.style.display = "none";
        shareBox.style.display = "none";
        shareLink.style.display = "none";

        document.getElementById("nameWrapper").style.display = "none";
        document.getElementById("titleSubText").style.display = "none";
        document.getElementById("titleInfoText").style.display = "none";

        titleText.innerHTML = `${decoded},<br>Will You Be My Valentine?`;

        document.querySelector(".buttons").style.display = "flex";
    }
}
function getShareText(name) {
  return `${name} said YES :)\nSome moments deserve to be shared.`;
}
/* ========== YES SCREEN ========== */
/* ========== YES SCREEN ========== */
function showLove() {
  const rawName = nameInput.value.trim();
  const name = rawName ? rawName : "My Love";

  // store name globally for share/send
  selectedName = name;

  // 🔥 GA Event – YES clicked
  if (window.gtag) {
    gtag('event', 'valentine_yes', {
      event_category: 'engagement',
      event_label: name
    });
  }

  document.body.innerHTML = `
    <div class="love-screen" id="loveScreen">
      <h1>${name}, this is our beginning ❤️</h1>
      <p>
        Some moments change days.<br/>
        Some choices change lives.<br/>
        And you just changed mine.
      </p>

      <img src="./assets/img/valentine.jpg" />

      <div style="margin-top:20px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
        <button onclick="captureAndShare()">📸 Save / Share</button>
        <button onclick="sendBack()">💌 Send on Whatsapp</button>
      </div>
    </div>
  `;
}


/* ========== screen cpature ========== */
async function captureAndShare() {
  // Create share-only layout dynamically
  const shareBox = document.createElement("div");
  shareBox.style.width = "420px";
  shareBox.style.background = "white";
  shareBox.style.padding = "40px";
  shareBox.style.borderRadius = "25px";
  shareBox.style.textAlign = "center";
  shareBox.style.boxShadow = "0 20px 40px rgba(0,0,0,.2)";
  shareBox.style.position = "fixed";
  shareBox.style.top = "-9999px";
  shareBox.style.left = "-9999px";

  shareBox.innerHTML = `
    <h1 style="color:#ff3366;">${selectedName} said YES ❤️</h1>
    <p style="font-size:18px;color:#555;margin-top:10px;">
      Yes, I will be your Valentine 💌<br/>
      Let’s make this a special moment.
    </p>
    <img
      src="./assets/img/valentine.jpg"
      style="width:100%;border-radius:20px;margin-top:20px;"
    />
  `;

  document.body.appendChild(shareBox);

  // Capture it
  const canvas = await html2canvas(shareBox, {
    scale: 2,
    useCORS: true
  });

  const imageBlob = await new Promise(resolve =>
    canvas.toBlob(resolve, "image/png")
  );

  const file = new File([imageBlob], "valentine.png", { type: "image/png" });
  const shareText = getShareText(selectedName);

  // Share or download
  if (navigator.share && navigator.canShare({ files: [file] })) {
    await navigator.share({
      title: "A special moment ❤️",
      text: shareText,
      files: [file]
    });
  } else {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "valentine-moment.png";
    link.click();
  }

  // Cleanup
  shareBox.remove();

  // Analytics
  if (window.gtag) {
    gtag("event", "screenshot_taken", {
      event_category: "engagement"
    });
  }
}

/* ========== SEND BACK ========== */
/* ========== SEND BACK ========== */
function sendBack() {
  const message = encodeURIComponent(
    getShareText(selectedName)
  );

  window.open(`https://wa.me/?text=${message}`, "_blank");

  if (window.gtag) {
    gtag('event', 'sent_back', {
      event_category: 'engagement'
    });
  }
}
/* ========== SPARKLES ========== */
function createSparkle() {
    const s = document.createElement("div");
    s.classList.add("sparkle");
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDuration = Math.random() * 3 + 4 + "s";
    document.body.appendChild(s);

    setTimeout(() => s.remove(), 6000);
}

setInterval(createSparkle, 400);

/* ========== INIT ========== */


yesBtn.addEventListener("click", showLove);

window.addEventListener("load", () => {
    checkPhase();
    placeNo();
    animate();
});

window.addEventListener("resize", placeNo);
