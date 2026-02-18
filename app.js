// Advertizement4all (A4A) - Front-end only MVP
// Features: upload or camera capture, template + prompt style copy generation,
// canvas preview, and download as PNG.

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
const detailsInput = document.getElementById("detailsInput");

const generateBtn = document.getElementById("generateBtn");
const randomBtn = document.getElementById("randomBtn");
const downloadBtn = document.getElementById("downloadBtn");
const resetBtn = document.getElementById("resetBtn");

const adCanvas = document.getElementById("adCanvas");
const ctx = adCanvas.getContext("2d");

const headlineOut = document.getElementById("headlineOut");
const bodyOut = document.getElementById("bodyOut");
const ctaOut = document.getElementById("ctaOut");

document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("backToTop").addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

let stream = null;
let currentImage = null; // HTMLImageElement

// Default canvas draw
drawEmptyCanvas();

function drawEmptyCanvas(){
  ctx.clearRect(0, 0, adCanvas.width, adCanvas.height);

  // Background gradient
  const g = ctx.createLinearGradient(0, 0, adCanvas.width, adCanvas.height);
  g.addColorStop(0, "rgba(124,92,255,0.18)");
  g.addColorStop(1, "rgba(45,212,191,0.12)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, adCanvas.width, adCanvas.height);

  // Frame
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 6;
  roundRect(ctx, 30, 30, adCanvas.width - 60, adCanvas.height - 60, 40);
  ctx.stroke();

  // Text
  ctx.fillStyle = "rgba(233,238,252,0.78)";
  ctx.font = "800 54px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Advertizement4all", 80, 190);

  ctx.font = "500 32px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillStyle = "rgba(233,238,252,0.68)";
  ctx.fillText("Upload or capture an image", 80, 260);
  ctx.fillText("then click Generate Ad.", 80, 310);

  // Placeholder photo box
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 4;
  roundRect(ctx, 80, 380, adCanvas.width - 160, 720, 34);
  ctx.stroke();

  ctx.fillStyle = "rgba(233,238,252,0.55)";
  ctx.font = "700 28px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Your image will appear here", 120, 760);
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

// ---------------------
// Image handling
// ---------------------
fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    currentImage = img;
    drawAdPreview(); // refresh preview
    downloadBtn.disabled = false;
    URL.revokeObjectURL(url);
  };
  img.src = url;
});

startCameraBtn.addEventListener("click", async () => {
  try{
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    video.srcObject = stream;
    video.classList.remove("hidden");
    takePhotoBtn.disabled = false;
    stopCameraBtn.disabled = false;
  } catch (err){
    alert("Camera permission denied or not available. You can still upload an image.");
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
    drawAdPreview();
    downloadBtn.disabled = false;
  };
  img.src = dataUrl;
});

stopCameraBtn.addEventListener("click", () => {
  stopCamera();
});

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

// ---------------------
// Ad copy generation (template-based “AI demo”)
// ---------------------
const COPY = {
  sale: {
    bold: {
      headline: (brand, offer) => `${offer || "Big Sale Today"} — ${brand || "Limited Time"}`,
      body: (brand, offer, details) => `Shop ${brand || "our store"} and grab ${offer || "special savings"} now. ${details || "Deals end soon."}`,
      cta: () => "Shop Now"
    },
    luxury: {
      headline: (brand, offer) => `Exclusive Offer — ${brand || "Premium Selection"}`,
      body: (brand, offer, details) => `${offer || "A refined deal"} crafted for those who expect the best. ${details || "Limited availability."}`,
      cta: () => "Explore Collection"
    },
    minimal: {
      headline: (brand, offer) => `${offer || "New Offer"}`,
      body: (brand, offer, details) => `${brand || "Your brand"} • ${details || "Simple. Clean. Fast."}`,
      cta: () => "Learn More"
    },
    funny: {
      headline: (brand, offer) => `${offer || "Deal Alert"} (Your wallet will smile 😄)`,
      body: (brand, offer, details) => `At ${brand || "our place"}, we’re basically giving this away. ${details || "Come grab it before it runs off!"}`,
      cta: () => "Get the Deal"
    },
    urgent: {
      headline: (brand, offer) => `Hurry! ${offer || "Limited-Time Deal"}`,
      body: (brand, offer, details) => `Only a short window left at ${brand || "our store"}. ${details || "Don’t miss out."}`,
      cta: () => "Claim Now"
    }
  },

  event: {
    bold: {
      headline: (brand, offer) => `${offer || "Special Event"} — Hosted by ${brand || "Your Brand"}`,
      body: (brand, offer, details) => `Join us for ${offer || "a must-see event"}. ${details || "Save the date and bring friends."}`,
      cta: () => "Reserve Spot"
    },
    luxury: {
      headline: (brand, offer) => `An Evening of Excellence — ${brand || "Exclusive Event"}`,
      body: (brand, offer, details) => `${offer || "A premium experience"} designed to impress. ${details || "Limited seating."}`,
      cta: () => "Request Invite"
    },
    minimal: {
      headline: (brand, offer) => `${offer || "Event Announcement"}`,
      body: (brand, offer, details) => `${brand || "Hosted by us"} • ${details || "Details inside"}`,
      cta: () => "See Details"
    },
    funny: {
      headline: (brand, offer) => `${offer || "Party Time"} 🎉`,
      body: (brand, offer, details) => `Come hang with ${brand || "us"} — it’ll be legendary. ${details || "You in?"}`,
      cta: () => "I’m In"
    },
    urgent: {
      headline: (brand, offer) => `Last Call — ${offer || "Event"}!`,
      body: (brand, offer, details) => `Spots are filling fast for ${brand || "our event"}. ${details || "Register ASAP."}`,
      cta: () => "Register Now"
    }
  },

  hiring: {
    bold: {
      headline: (brand, offer) => `Now Hiring — ${offer || "Join Our Team"}`,
      body: (brand, offer, details) => `${brand || "We"} are hiring now. ${offer || "Great role"} with strong growth potential. ${details || "Apply today."}`,
      cta: () => "Apply Now"
    },
    luxury: {
      headline: (brand, offer) => `Careers at ${brand || "Our Company"}`,
      body: (brand, offer, details) => `${offer || "A premium opportunity"} for top talent. ${details || "Professional environment."}`,
      cta: () => "View Openings"
    },
    minimal: {
      headline: (brand, offer) => `Hiring: ${offer || "Open Role"}`,
      body: (brand, offer, details) => `${brand || "Company"} • ${details || "Send resume"}`,
      cta: () => "Contact"
    },
    funny: {
      headline: (brand, offer) => `We Need You 😄`,
      body: (brand, offer, details) => `${brand || "We"} promise meetings aren’t scary. ${offer || "Great job"} — ${details || "Apply now!"}`,
      cta: () => "Join Us"
    },
    urgent: {
      headline: (brand, offer) => `Hiring Fast — ${offer || "Immediate Openings"}`,
      body: (brand, offer, details) => `Positions closing soon at ${brand || "our company"}. ${details || "Apply today."}`,
      cta: () => "Apply Today"
    }
  },

  realestate: {
    bold: {
      headline: (brand, offer) => `${offer || "New Listing"} — ${brand || "Prime Location"}`,
      body: (brand, offer, details) => `Don’t miss this opportunity. ${details || "Schedule a showing today."}`,
      cta: () => "Schedule Tour"
    },
    luxury: {
      headline: (brand, offer) => `Luxury Living — ${offer || "Now Available"}`,
      body: (brand, offer, details) => `${brand || "A premium property"} with exceptional details. ${details || "Serious inquiries only."}`,
      cta: () => "View Details"
    },
    minimal: {
      headline: (brand, offer) => `${offer || "Property Available"}`,
      body: (brand, offer, details) => `${details || "Contact for info"}`,
      cta: () => "Inquire"
    },
    funny: {
      headline: (brand, offer) => `${offer || "Your New Home"} 🏡`,
      body: (brand, offer, details) => `Warning: you may never want to leave. ${details || "Come see it!"}`,
      cta: () => "Tour It"
    },
    urgent: {
      headline: (brand, offer) => `Hot Listing — Act Fast!`,
      body: (brand, offer, details) => `${offer || "This home"} won’t last. ${details || "Book a tour today."}`,
      cta: () => "Book Now"
    }
  },

  food: {
    bold: {
      headline: (brand, offer) => `${offer || "Today’s Special"} — ${brand || "Fresh & Delicious"}`,
      body: (brand, offer, details) => `Come taste it today. ${details || "Dine-in or takeout."}`,
      cta: () => "Order Now"
    },
    luxury: {
      headline: (brand, offer) => `Chef’s Selection — ${offer || "Premium Special"}`,
      body: (brand, offer, details) => `${brand || "A refined bite"} crafted to impress. ${details || "Limited servings."}`,
      cta: () => "Reserve Table"
    },
    minimal: {
      headline: (brand, offer) => `${offer || "Special"}`,
      body: (brand, offer, details) => `${brand || "Restaurant"} • ${details || "Open today"}`,
      cta: () => "Menu"
    },
    funny: {
      headline: (brand, offer) => `${offer || "Food Alert"} 🍔`,
      body: (brand, offer, details) => `Your stomach called. It wants ${offer || "this"} from ${brand || "us"}. ${details || ""}`,
      cta: () => "Feed Me"
    },
    urgent: {
      headline: (brand, offer) => `Limited Special — Today Only!`,
      body: (brand, offer, details) => `${offer || "This deal"} ends soon. ${details || "Order now."}`,
      cta: () => "Order Fast"
    }
  },

  apppromo: {
    bold: {
      headline: (brand, offer) => `${brand || "New App"} — ${offer || "Try It Today"}`,
      body: (brand, offer, details) => `Simple. Powerful. Built for speed. ${details || "Download and start now."}`,
      cta: () => "Download"
    },
    luxury: {
      headline: (brand, offer) => `A Premium Experience — ${brand || "Your Product"}`,
      body: (brand, offer, details) => `${offer || "Designed for quality"} and built to stand out. ${details || "Try it today."}`,
      cta: () => "Get Access"
    },
    minimal: {
      headline: (brand, offer) => `${brand || "Product"} • ${offer || "Now Live"}`,
      body: (brand, offer, details) => `${details || "Tap to learn more"}`,
      cta: () => "Learn More"
    },
    funny: {
      headline: (brand, offer) => `${brand || "New App"} 😄`,
      body: (brand, offer, details) => `It’s like magic, but legal. ${offer || "Try it"} — ${details || "Your future self will thank you."}`,
      cta: () => "Try It"
    },
    urgent: {
      headline: (brand, offer) => `Limited Launch Offer!`,
      body: (brand, offer, details) => `${brand || "Our product"} is live. ${offer || "Early access"} ends soon. ${details || ""}`,
      cta: () => "Start Now"
    }
  }
};

function safePick(obj, key, fallbackKey){
  return obj[key] || obj[fallbackKey];
}

function generateCopy(){
  const template = templateSelect.value;
  const style = promptSelect.value;

  const brand = brandInput.value.trim();
  const offer = offerInput.value.trim();
  const details = detailsInput.value.trim();

  const pack = safePick(COPY[template], style, "bold");

  const headline = pack.headline(brand, offer);
  const body = pack.body(brand, offer, details);
  const cta = pack.cta(brand, offer, details);

  headlineOut.textContent = headline;
  bodyOut.textContent = body;
  ctaOut.textContent = cta;

  return { headline, body, cta, brand, offer, details, template, style };
}

// ---------------------
// Canvas Ad Render
// ---------------------
function drawAdPreview(){
  // If no image yet, draw placeholder
  if (!currentImage){
    drawEmptyCanvas();
    return;
  }

  const copy = generateCopyForPreview();
  drawAd(currentImage, copy);
}

function generateCopyForPreview(){
  // If user hasn't clicked generate, still show something
  const brand = brandInput.value.trim() || "Your Brand";
  const offer = offerInput.value.trim() || "Your Offer Here";
  const details = detailsInput.value.trim() || "Add details like phone, location, website";
  const template = templateSelect.value;
  const style = promptSelect.value;

  const pack = safePick(COPY[template], style, "bold");
  return {
    headline: pack.headline(brand, offer),
    body: pack.body(brand, offer, details),
    cta: pack.cta(brand, offer, details),
    brand, offer, details
  };
}

function drawAd(img, copy){
  ctx.clearRect(0, 0, adCanvas.width, adCanvas.height);

  // Draw image as background (cover)
  const cw = adCanvas.width;
  const ch = adCanvas.height;
  const ir = img.width / img.height;
  const cr = cw / ch;

  let dw, dh, dx, dy;
  if (ir > cr){
    dh = ch;
    dw = dh * ir;
    dx = (cw - dw) / 2;
    dy = 0;
  } else {
    dw = cw;
    dh = dw / ir;
    dx = 0;
    dy = (ch - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);

  // Dark overlay gradient for text readability
  const grad = ctx.createLinearGradient(0, 0, 0, ch);
  grad.addColorStop(0, "rgba(0,0,0,0.15)");
  grad.addColorStop(0.55, "rgba(0,0,0,0.55)");
  grad.addColorStop(1, "rgba(0,0,0,0.78)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cw, ch);

  // Accent top bar
  ctx.fillStyle = "rgba(124,92,255,0.85)";
  roundRect(ctx, 60, 60, cw - 120, 16, 10);
  ctx.fill();

  // Title text area
  const padX = 90;
  let y = 180;

  ctx.fillStyle = "rgba(233,238,252,0.95)";
  ctx.font = "900 78px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  y = wrapText(copy.headline, padX, y, cw - padX*2, 86);

  // Body text
  ctx.fillStyle = "rgba(233,238,252,0.80)";
  ctx.font = "600 38px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  y += 18;
  y = wrapText(copy.body, padX, y, cw - padX*2, 52);

  // CTA button
  const btnText = copy.cta.toUpperCase();
  ctx.font = "900 34px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  const textW = ctx.measureText(btnText).width;

  const btnW = Math.max(380, textW + 90);
  const btnH = 84;
  const btnX = padX;
  const btnY = ch - 170;

  // CTA background
  const ctag = ctx.createLinearGradient(btnX, btnY, btnX + btnW, btnY + btnH);
  ctag.addColorStop(0, "rgba(124,92,255,1)");
  ctag.addColorStop(1, "rgba(45,212,191,0.9)");
  ctx.fillStyle = ctag;
  roundRect(ctx, btnX, btnY, btnW, btnH, 22);
  ctx.fill();

  // CTA text
  ctx.fillStyle = "rgba(11,15,23,0.95)";
  ctx.fillText(btnText, btnX + 40, btnY + 56);

  // Footer brand
  ctx.fillStyle = "rgba(233,238,252,0.70)";
  ctx.font = "700 26px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText(copy.brand, padX, ch - 80);
  ctx.font = "600 22px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial";
  ctx.fillText("Made with Advertizement4all", padX, ch - 46);

  // Frame
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
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
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

// ---------------------
// Buttons & actions
// ---------------------
generateBtn.addEventListener("click", () => {
  const copy = generateCopy();

  if (!currentImage){
    alert("Please upload an image or take a photo first.");
    return;
  }
  drawAd(currentImage, copy);
  downloadBtn.disabled = false;
});

randomBtn.addEventListener("click", () => {
  const brands = ["Parth Media Lab", "Phoenix Deals", "Desert Shine", "OSSS Studios", "Skyline Realty", "Fresh Bite"];
  const offers = ["30% OFF Today", "Grand Opening", "Hiring Now", "Luxury Listing", "2-for-1 Special", "Download Now"];
  const details = [
    "Phoenix, AZ • Limited time",
    "This weekend • RSVP now",
    "Apply today • Great pay",
    "3 bed • 2 bath • Tour today",
    "Order pickup or delivery",
    "Available on iOS & Android"
  ];

  brandInput.value = brands[Math.floor(Math.random() * brands.length)];
  offerInput.value = offers[Math.floor(Math.random() * offers.length)];
  detailsInput.value = details[Math.floor(Math.random() * details.length)];

  // change template/style randomly
  const templates = ["sale","event","hiring","realestate","food","apppromo"];
  const styles = ["bold","luxury","minimal","funny","urgent"];
  templateSelect.value = templates[Math.floor(Math.random() * templates.length)];
  promptSelect.value = styles[Math.floor(Math.random() * styles.length)];

  // If image exists, redraw preview
  if (currentImage) {
    const copy = generateCopy();
    drawAd(currentImage, copy);
    downloadBtn.disabled = false;
  } else {
    // just update text outputs
    generateCopy();
  }
});

downloadBtn.addEventListener("click", () => {
  if (!currentImage){
    alert("Please upload an image or take a photo first.");
    return;
  }
  const link = document.createElement("a");
  link.download = `Advertizement4all_ad_${Date.now()}.png`;
  link.href = adCanvas.toDataURL("image/png");
  link.click();
});

resetBtn.addEventListener("click", () => {
  stopCamera();
  fileInput.value = "";
  brandInput.value = "";
  offerInput.value = "";
  detailsInput.value = "";
  templateSelect.value = "sale";
  promptSelect.value = "bold";

  headlineOut.textContent = "—";
  bodyOut.textContent = "—";
  ctaOut.textContent = "—";

  currentImage = null;
  downloadBtn.disabled = true;
  drawEmptyCanvas();
});

// Live redraw when user changes options (if image exists)
[templateSelect, promptSelect, brandInput, offerInput, detailsInput].forEach(el => {
  el.addEventListener("input", () => {
    if (!currentImage) return;
    drawAdPreview();
  });
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
      alert("Copy failed. You can manually select the text and copy.");
    }
  });
});
