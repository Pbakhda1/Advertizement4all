const fileInput = document.getElementById("fileInput");
const startCameraBtn = document.getElementById("startCamera");
const takePhotoBtn = document.getElementById("takePhoto");
const stopCameraBtn = document.getElementById("stopCamera");

const video = document.getElementById("video");
const snapCanvas = document.getElementById("snapCanvas");

const templateSelect = document.getElementById("templateSelect");
const promptSelect = document.getElementById("promptSelect");

const brandInput = document.getElementById("brandInput");
const offerInput = document.getElementById("offerInput");
const priceInput = document.getElementById("priceInput");
const detailsInput = document.getElementById("detailsInput");

const generateBtn = document.getElementById("generateBtn");
const randomBtn = document.getElementById("randomBtn");
const downloadBtn = document.getElementById("downloadBtn");
const shareBtn = document.getElementById("shareBtn");
const resetBtn = document.getElementById("resetBtn");

const adCanvas = document.getElementById("adCanvas");
const ctx = adCanvas.getContext("2d");

const headlineOut = document.getElementById("headlineOut");
const bodyOut = document.getElementById("bodyOut");
const ctaOut = document.getElementById("ctaOut");

const startReactionBtn = document.getElementById("startReaction");
const stopReactionBtn = document.getElementById("stopReaction");
const reactionStatus = document.getElementById("reactionStatus");

// Negotiation UI
const offerPriceInput = document.getElementById("offerPriceInput");
const sendOfferBtn = document.getElementById("sendOfferBtn");
const negStatus = document.getElementById("negStatus");
const negActions = document.getElementById("negActions");
const counterPriceInput = document.getElementById("counterPriceInput");
const counterBtn = document.getElementById("counterBtn");
const acceptBtn = document.getElementById("acceptBtn");
const declineBtn = document.getElementById("declineBtn");

document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("backToTop").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

let stream = null;
let currentImage = null;
let emphasis = 0.55;

// safe reaction mode uses brightness stability only
let reactionStream = null;
let reactionTimer = null;

drawEmptyCanvas();

const COPY = {
  sale: {
    bold: {
      headline: (b, o) => `${o || "BIG SALE"} — ${b || "Today Only"}`,
      body: (b, o, d) => `Shop ${b || "our store"} for ${o || "limited-time savings"}. ${d || "Don’t miss it."}`,
      cta: () => "Shop Now"
    },
    luxury: {
      headline: (b) => `Exclusive Offer — ${b || "Premium"}`,
      body: (b, o, d) => `${o || "A refined deal"} built for those who expect more. ${d || "Limited availability."}`,
      cta: () => "Explore"
    },
    minimal: {
      headline: (b, o) => `${o || "New Offer"}`,
      body: (b, o, d) => `${b || "Your brand"} • ${d || "Simple. Clean. Fast."}`,
      cta: () => "Learn More"
    },
    funny: {
      headline: (b, o) => `${o || "Deal Alert"} 😄`,
      body: (b, o, d) => `At ${b || "our place"}, your wallet is about to smile. ${d || "Come grab it!"}`,
      cta: () => "Get It"
    },
    urgent: {
      headline: (b, o) => `Hurry! ${o || "Limited-Time Deal"}`,
      body: (b, o, d) => `Only a short window left at ${b || "our store"}. ${d || "Act now."}`,
      cta: () => "Claim Now"
    }
  },
  event: {
    bold: {
      headline: (b, o) => `${o || "Special Event"} — ${b || "Hosted by us"}`,
      body: (b, o, d) => `Join ${b || "us"} for ${o || "a great event"}. ${d || "Save the date."}`,
      cta: () => "RSVP"
    },
    luxury: {
      headline: (b) => `An Evening of Excellence — ${b || "Exclusive"}`,
      body: (b, o, d) => `${o || "A premium experience"} designed to impress. ${d || "Limited seating."}`,
      cta: () => "Request Invite"
    },
    minimal: {
      headline: (b, o) => `${o || "Event Announcement"}`,
      body: (b, o, d) => `${b || "Hosted by us"} • ${d || "Details inside"}`,
      cta: () => "Details"
    },
    funny: {
      headline: (b, o) => `${o || "Party Time"} 🎉`,
      body: (b, o, d) => `Come through with ${b || "us"} — it’ll be legendary. ${d || ""}`,
      cta: () => "I’m In"
    },
    urgent: {
      headline: (b, o) => `Last Call — ${o || "Event"}!`,
      body: (b, o, d) => `Spots are filling fast for ${b || "our event"}. ${d || "Register ASAP."}`,
      cta: () => "Register"
    }
  },
  hiring: {
    bold: {
      headline: (b, o) => `Now Hiring — ${o || "Join Our Team"}`,
      body: (b, o, d) => `${b || "We"} are hiring now. ${o || "Great role"} with growth. ${d || "Apply today."}`,
      cta: () => "Apply Now"
    },
    luxury: {
      headline: (b) => `Careers at ${b || "Our Company"}`,
      body: (b, o, d) => `${o || "A premium opportunity"} for top talent. ${d || "Professional environment."}`,
      cta: () => "View Openings"
    },
    minimal: {
      headline: (b, o) => `Hiring: ${o || "Open Role"}`,
      body: (b, o, d) => `${b || "Company"} • ${d || "Send resume"}`,
      cta: () => "Contact"
    },
    funny: {
      headline: (b) => `We Need You 😄`,
      body: (b, o, d) => `${b || "We"} promise the job is cooler than it sounds. ${d || "Apply now!"}`,
      cta: () => "Join Us"
    },
    urgent: {
      headline: (b, o) => `Hiring Fast — ${o || "Openings"}`,
      body: (b, o, d) => `Positions closing soon at ${b || "our company"}. ${d || "Apply today."}`,
      cta: () => "Apply Today"
    }
  },
  realestate: {
    bold: {
      headline: (b, o) => `${o || "New Listing"} — ${b || "Prime Location"}`,
      body: (b, o, d) => `Don’t miss this opportunity. ${d || "Schedule a showing today."}`,
      cta: () => "Schedule Tour"
    },
    luxury: {
      headline: (b, o) => `Luxury Living — ${o || "Now Available"}`,
      body: (b, o, d) => `${b || "A premium property"} with exceptional details. ${d || "Inquire today."}`,
      cta: () => "View Details"
    },
    minimal: {
      headline: (b, o) => `${o || "Property Available"}`,
      body: (b, o, d) => `${d || "Contact for info"}`,
      cta: () => "Inquire"
    },
    funny: {
      headline: (b, o) => `${o || "Your New Home"} 🏡`,
      body: (b, o, d) => `Warning: you may never want to leave. ${d || "Come see it!"}`,
      cta: () => "Tour It"
    },
    urgent: {
      headline: () => `Hot Listing — Act Fast!`,
      body: (b, o, d) => `${o || "This home"} won’t last. ${d || "Book a tour today."}`,
      cta: () => "Book Now"
    }
  },
  food: {
    bold: {
      headline: (b, o) => `${o || "Today’s Special"} — ${b || "Fresh & Delicious"}`,
      body: (b, o, d) => `Come taste it today. ${d || "Dine-in or takeout."}`,
      cta: () => "Order Now"
    },
    luxury: {
      headline: (b, o) => `Chef’s Selection — ${o || "Premium Special"}`,
      body: (b, o, d) => `${b || "A refined bite"} crafted to impress. ${d || "Limited servings."}`,
      cta: () => "Reserve"
    },
    minimal: {
      headline: (b, o) => `${o || "Special"}`,
      body: (b, o, d) => `${b || "Restaurant"} • ${d || "Open today"}`,
      cta: () => "Menu"
    },
    funny: {
      headline: (b, o) => `${o || "Food Alert"} 🍔`,
      body: (b, o, d) => `Your stomach called. It wants ${o || "this"} from ${b || "us"}. ${d || ""}`,
      cta: () => "Feed Me"
    },
    urgent: {
      headline: () => `Limited Special — Today Only!`,
      body: (b, o, d) => `${o || "This deal"} ends soon. ${d || "Order now."}`,
      cta: () => "Order Fast"
    }
  },
  apppromo: {
    bold: {
      headline: (b, o) => `${b || "New Product"} — ${o || "Try It Today"}`,
      body: (b, o, d) => `Simple. Powerful. Built for speed. ${d || "Download now."}`,
      cta: () => "Get Started"
    },
    luxury: {
      headline: (b) => `A Premium Experience — ${b || "Your Product"}`,
      body: (b, o, d) => `${o || "Designed for quality"} and built to stand out. ${d || "Try it today."}`,
      cta: () => "Get Access"
    },
    minimal: {
      headline: (b, o) => `${b || "Product"} • ${o || "Now Live"}`,
      body: (b, o, d) => `${d || "Tap to learn more"}`,
      cta: () => "Learn More"
    },
    funny: {
      headline: (b) => `${b || "New App"} 😄`,
      body: (b, o, d) => `It’s like magic, but legal. ${o || "Try it"} — ${d || ""}`,
      cta: () => "Try It"
    },
    urgent: {
      headline: () => `Limited Launch Offer!`,
      body: (b, o, d) => `${b || "Our product"} is live. ${o || "Early access"} ends soon. ${d || ""}`,
      cta: () => "Start Now"
    }
  }
};

function safePick(obj, key, fallbackKey){ return obj[key] || obj[fallbackKey]; }

function generateCopy(){
  const template = templateSelect.value;
  const style = promptSelect.value;

  const brand = brandInput.value.trim() || "Your Brand";
  const offer = offerInput.value.trim() || "Your Offer Here";
  const price = priceInput.value.trim();
  const details = detailsInput.value.trim() || "Add details like phone, location, website";

  const pack = safePick(COPY[template], style, "bold");

  const headline = pack.headline(brand, offer);
  const body = pack.body(brand, offer, details);
  const cta = pack.cta(brand, offer, details);

  headlineOut.textContent = headline;
  bodyOut.textContent = body;
  ctaOut.textContent = cta;

  return { headline, body, cta, brand, offer, price, details };
}

function drawEmptyCanvas(){
  ctx.clearRect(0, 0, adCanvas.width, adCanvas.height);
  const g = ctx.createLinearGradient(0, 0, adCanvas.width, adCanvas.height);
  g.addColorStop(0, "rgba(124,92,255,0.18)");
  g.addColorStop(1, "rgba(45,212,191,0.12)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, adCanvas.width, adCanvas.height);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 6;
  roundRect(ctx, 30, 30, adCanvas.width - 60, adCanvas.height - 60, 40);
  ctx.stroke();

  ctx.fillStyle = "rgba(233,238,252,0.85)";
  ctx.font = "900 54px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Advertizement4all", 80, 190);

  ctx.fillStyle = "rgba(233,238,252,0.68)";
  ctx.font = "600 32px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Upload or capture an image", 80, 260);
  ctx.fillText("then click Generate Ad.", 80, 310);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 4;
  roundRect(ctx, 80, 380, adCanvas.width - 160, 720, 34);
  ctx.stroke();

  ctx.fillStyle = "rgba(233,238,252,0.55)";
  ctx.font = "700 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Your image will appear here", 120, 760);
}

function drawAd(img, copy){
  const cw = adCanvas.width;
  const ch = adCanvas.height;
  ctx.clearRect(0, 0, cw, ch);

  const ir = img.width / img.height;
  const cr = cw / ch;
  let dw, dh, dx, dy;

  if (ir > cr){
    dh = ch; dw = dh * ir; dx = (cw - dw) / 2; dy = 0;
  } else {
    dw = cw; dh = dw / ir; dx = 0; dy = (ch - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);

  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, "rgba(0,0,0,0.18)");
  grad.addColorStop(0.55, `rgba(0,0,0,${0.45 + emphasis * 0.25})`);
  grad.addColorStop(1, `rgba(0,0,0,${0.72 + emphasis * 0.18})`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  // accent bar
  ctx.fillStyle = "rgba(124,92,255,0.85)";
  roundRect(ctx, 60, 60, cw - 120, 16, 10);
  ctx.fill();

  const padX = 90;
  let y = 180;

  // headline
  ctx.fillStyle = "rgba(233,238,252,0.96)";
  ctx.font = "900 78px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  y = wrapText(copy.headline, padX, y, cw - padX*2, 86);

  // price badge (static, user-defined)
  if (copy.price){
    ctx.save();
    ctx.fillStyle = "rgba(45,212,191,0.18)";
    ctx.strokeStyle = "rgba(45,212,191,0.40)";
    ctx.lineWidth = 4;
    const badgeW = 320, badgeH = 86;
    const bx = cw - padX - badgeW;
    const by = 170;
    roundRect(ctx, bx, by, badgeW, badgeH, 22);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgba(233,238,252,0.95)";
    ctx.font = "900 44px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(copy.price, bx + 34, by + 58);
    ctx.restore();
  }

  // body
  ctx.fillStyle = "rgba(233,238,252,0.82)";
  ctx.font = "700 38px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  y += 18;
  y = wrapText(copy.body, padX, y, cw - padX*2, 52);

  // CTA
  const btnText = copy.cta.toUpperCase();
  ctx.font = "900 34px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const textW = ctx.measureText(btnText).width;

  const btnW = Math.max(380, textW + 90);
  const btnH = 84;
  const btnX = padX;
  const btnY = ch - 170;

  ctx.save();
  ctx.shadowColor = `rgba(124,92,255,${0.15 + emphasis * 0.35})`;
  ctx.shadowBlur = 30 + emphasis * 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 12;

  const ctag = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  ctag.addColorStop(0, "rgba(124,92,255,1)");
  ctag.addColorStop(1, "rgba(45,212,191,0.9)");
  ctx.fillStyle = ctag;
  roundRect(ctx, btnX, btnY, btnW, btnH, 22);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(11,15,23,0.95)";
  ctx.fillText(btnText, btnX + 40, btnY + 56);

  // footer
  ctx.fillStyle = "rgba(233,238,252,0.72)";
  ctx.font = "800 26px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(copy.brand, padX, ch - 80);
  ctx.font = "700 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Made with Advertizement4all", padX, ch - 46);

  // frame
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 6;
  roundRect(ctx, 30, 30, cw - 60, ch - 60, 40);
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r){
  const radius = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(text, x, y, maxWidth, lineHeight){
  const words = String(text).split(" ");
  let line = "";
  for (let n = 0; n < words.length; n++){
    const testLine = line + words[n] + " ";
    const testWidth = ctx.measureText(testLine).width;
    if (testWidth > maxWidth && n > 0){
      ctx.fillText(line.trim(), x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, y);
  return y + lineHeight;
}

// Upload
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    const copy = generateCopy();
    drawAd(currentImage, copy);
    downloadBtn.disabled = false;
    shareBtn.disabled = false;
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

// Camera capture
startCameraBtn.addEventListener("click", async () => {
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.classList.remove("hidden");
    takePhotoBtn.disabled = false;
    stopCameraBtn.disabled = false;
  } catch {
    alert("Camera not available or permission denied. You can still upload an image.");
  }
});

takePhotoBtn.addEventListener("click", () => {
  if (!stream) return;
  const w = video.videoWidth || 1280;
  const h = video.videoHeight || 720;

  snapCanvas.width = w;
  snapCanvas.height = h;

  const sctx = snapCanvas.getContext("2d");
  sctx.drawImage(video, 0, 0, w, h);

  const dataUrl = snapCanvas.toDataURL("image/png");
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    const copy = generateCopy();
    drawAd(currentImage, copy);
    downloadBtn.disabled = false;
    shareBtn.disabled = false;
  };
  img.src = dataUrl;
});

stopCameraBtn.addEventListener("click", stopCamera);

function stopCamera(){
  if (stream){
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
  video.classList.add("hidden");
  takePhotoBtn.disabled = true;
  stopCameraBtn.disabled = true;
}

// Generate
generateBtn.addEventListener("click", () => {
  const copy = generateCopy();
  if (!currentImage){
    alert("Please upload an image or take a photo first.");
    return;
  }
  drawAd(currentImage, copy);
  downloadBtn.disabled = false;
  shareBtn.disabled = false;
});

randomBtn.addEventListener("click", () => {
  const brands = ["Parth Streetwear", "Phoenix Deals", "Desert Shine", "A4A Studio", "Skyline Realty", "Fresh Bite"];
  const offers = ["NEW DROP • LIMITED", "30% OFF TODAY", "HIRING NOW", "OPEN HOUSE THIS WEEKEND", "2-FOR-1 SPECIAL", "DOWNLOAD NOW"];
  const details = [
    "Phoenix, AZ • Shop now • @yourhandle",
    "Limited time • While supplies last",
    "Apply today • Fast hiring",
    "3 bed • 2 bath • Tour today",
    "Pickup or delivery • Order now",
    "Available now • Try it free"
  ];
  const prices = ["$30", "$25", "$19.99", "$49", "$9.99", "$99"];

  brandInput.value = brands[Math.floor(Math.random() * brands.length)];
  offerInput.value = offers[Math.floor(Math.random() * offers.length)];
  detailsInput.value = details[Math.floor(Math.random() * details.length)];
  priceInput.value = prices[Math.floor(Math.random() * prices.length)];

  const templates = ["sale","event","hiring","realestate","food","apppromo"];
  const styles = ["bold","luxury","minimal","funny","urgent"];
  templateSelect.value = templates[Math.floor(Math.random() * templates.length)];
  promptSelect.value = styles[Math.floor(Math.random() * styles.length)];

  const copy = generateCopy();
  if (currentImage) drawAd(currentImage, copy);
});

// Reset
resetBtn.addEventListener("click", () => {
  stopCamera();
  stopReactionMode();

  fileInput.value = "";
  brandInput.value = "";
  offerInput.value = "";
  priceInput.value = "";
  detailsInput.value = "";
  templateSelect.value = "sale";
  promptSelect.value = "bold";

  headlineOut.textContent = "—";
  bodyOut.textContent = "—";
  ctaOut.textContent = "—";

  currentImage = null;
  downloadBtn.disabled = true;
  shareBtn.disabled = true;

  emphasis = 0.55;
  resetNegotiation();
  drawEmptyCanvas();
});

// Live redraw
[templateSelect, promptSelect, brandInput, offerInput, priceInput, detailsInput].forEach(el => {
  el.addEventListener("input", () => {
    const copy = generateCopy();
    if (!currentImage) return;
    drawAd(currentImage, copy);
  });
});

// Download
downloadBtn.addEventListener("click", () => {
  if (!currentImage) return;
  const link = document.createElement("a");
  link.download = `Advertizement4all_ad_${Date.now()}.png`;
  link.href = adCanvas.toDataURL("image/png");
  link.click();
});

// Share (AirDrop via iOS share sheet)
shareBtn.addEventListener("click", async () => {
  if (!currentImage) return;

  const blob = await new Promise(resolve => adCanvas.toBlob(resolve, "image/png"));
  if (!blob){
    alert("Share failed. Please use Download PNG instead.");
    return;
  }

  const file = new File([blob], `Advertizement4all_ad.png`, { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })){
    try{
      await navigator.share({
        title: "Advertizement4all Ad",
        text: "Made with Advertizement4all",
        files: [file]
      });
    } catch {
      // user cancelled
    }
  } else {
    alert("Sharing not supported here. Download PNG and AirDrop from Photos/Files.");
  }
});

// Copy buttons
document.querySelectorAll(".copy-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const which = btn.getAttribute("data-copy");
    const text =
      which === "headline" ? headlineOut.textContent :
      which === "body" ? bodyOut.textContent :
      ctaOut.textContent;

    try{
      await navigator.clipboard.writeText(text);
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = "Copy"), 900);
    } catch {
      alert("Copy failed. You can manually copy.");
    }
  });
});

// ---------- Safe Reaction Mode ----------
startReactionBtn.addEventListener("click", startReactionMode);
stopReactionBtn.addEventListener("click", stopReactionMode);

async function startReactionMode(){
  if (reactionStream) return;
  try{
    reactionStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    // reuse same video element
    video.srcObject = reactionStream;
    video.classList.remove("hidden");

    startReactionBtn.disabled = true;
    stopReactionBtn.disabled = false;
    reactionStatus.textContent = "Status: Running (design emphasis adapts)";

    reactionTimer = setInterval(() => {
      if (!video.videoWidth || !video.videoHeight) return;

      const w = 64, h = 64;
      snapCanvas.width = w;
      snapCanvas.height = h;

      const sctx = snapCanvas.getContext("2d", { willReadFrequently: true });
      sctx.drawImage(video, 0, 0, w, h);

      const data = sctx.getImageData(0, 0, w, h).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4){
        sum += (0.2126 * data[i] + 0.7152 * data[i+1] + 0.0722 * data[i+2]);
      }
      const avg = sum / (w*h);

      const target = clamp((avg - 40) / 180, 0.25, 0.95);
      emphasis = lerp(emphasis, target, 0.08);

      if (currentImage){
        const copy = generateCopy();
        drawAd(currentImage, copy);
      }
    }, 250);

  } catch {
    alert("Reaction Mode needs camera permission. You can still use upload + generate.");
  }
}

function stopReactionMode(){
  if (reactionTimer){
    clearInterval(reactionTimer);
    reactionTimer = null;
  }
  if (reactionStream){
    reactionStream.getTracks().forEach(t => t.stop());
    reactionStream = null;
  }
  // if main camera isn't active, hide video
  if (!stream){
    video.srcObject = null;
    video.classList.add("hidden");
  }

  startReactionBtn.disabled = false;
  stopReactionBtn.disabled = true;
  reactionStatus.textContent = "Status: Off";
}

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
function lerp(a, b, t){ return a + (b - a) * t; }

// ---------- Negotiation (Demo) ----------
let negotiation = {
  active: false,
  listedPrice: null,
  buyerOffer: null,
  sellerCounter: null,
  status: "idle"
};

function normalizeMoney(str){
  const s = (str || "").trim();
  if (!s) return null;
  // keep digits and dot
  const num = Number(s.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(num) || num <= 0) return null;
  return num;
}
function money(num){
  return `$${num.toFixed(2).replace(/\.00$/, "")}`;
}

sendOfferBtn.addEventListener("click", () => {
  const listed = normalizeMoney(priceInput.value) || 30; // fallback
  const offer = normalizeMoney(offerPriceInput.value);

  if (!offer){
    negStatus.textContent = "Please enter a valid offer like $25.";
    negActions.classList.add("hidden");
    return;
  }

  negotiation.active = true;
  negotiation.listedPrice = listed;
  negotiation.buyerOffer = offer;
  negotiation.sellerCounter = null;
  negotiation.status = "offer_sent";

  negStatus.textContent = `Buyer offered ${money(offer)} (listed ${money(listed)}). Seller can counter, accept, or decline.`;
  negActions.classList.remove("hidden");

  // prefill a suggested counter
  const suggested = Math.max(offer, Math.min(listed, (offer + listed) / 2));
  counterPriceInput.value = money(suggested);
});

counterBtn.addEventListener("click", () => {
  if (!negotiation.active) return;

  const counter = normalizeMoney(counterPriceInput.value);
  if (!counter){
    negStatus.textContent = "Enter a valid counter like $28.";
    return;
  }

  negotiation.sellerCounter = counter;
  negotiation.status = "counter_sent";
  negStatus.textContent = `Seller countered at ${money(counter)}. Buyer can accept or make a new offer (demo).`;

  // In a real app, you'd now wait for buyer response via backend/chat.
});

acceptBtn.addEventListener("click", () => {
  if (!negotiation.active) return;

  const finalPrice = negotiation.sellerCounter ?? negotiation.buyerOffer ?? normalizeMoney(priceInput.value) ?? 30;
  negotiation.status = "deal_confirmed";

  negStatus.textContent = `Deal confirmed at ${money(finalPrice)} ✅ (Demo).`;
  negActions.classList.add("hidden");

  // Update price field to reflect final agreement (optional)
  priceInput.value = money(finalPrice);

  // Redraw ad with updated price
  if (currentImage){
    const copy = generateCopy();
    drawAd(currentImage, copy);
  }
});

declineBtn.addEventListener("click", () => {
  if (!negotiation.active) return;
  negotiation.status = "declined";
  negStatus.textContent = "Offer declined ❌ (Demo).";
  negActions.classList.add("hidden");
});

function resetNegotiation(){
  negotiation = { active:false, listedPrice:null, buyerOffer:null, sellerCounter:null, status:"idle" };
  offerPriceInput.value = "";
  counterPriceInput.value = "";
  negStatus.textContent = "No negotiation yet.";
  negActions.classList.add("hidden");
}
