// ===== VIDEO AUTO-PLAY FOR CARD VIDEOS =====
const cardVideos = document.querySelectorAll(".media-box video");

const observerOptions = { threshold: 0.5 };

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.play();
    else entry.target.pause();
  });
}, observerOptions);

cardVideos.forEach((v) => videoObserver.observe(v));

// ===== SEARCH + FILTER =====
const searchBar = document.getElementById("searchBar");
const mediaBoxes = document.querySelectorAll(".media-box");
const filterBtns = document.querySelectorAll(".filter-btn[data-filter]");
const noResults = document.getElementById("noResults");

const mediaItems = Array.from(mediaBoxes).map((box) => {
  const tagString = box.getAttribute("data-tags") || "";
  const tags = tagString
    .toLowerCase()
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    element: box,
    title: (box.getAttribute("data-title") || "").toLowerCase(),
    tags,
    type: box.getAttribute("data-type"),
    premium: box.getAttribute("data-premium") === "true",
  };
});

function matchesSearch(item, query) {
  if (!query) return true;
  query = query.toLowerCase().trim();

  if (item.tags.includes(query)) return true;
  if (item.tags.some((tag) => tag.includes(query))) return true;
  return item.title.includes(query);
}

function matchesFilter(item, filterType) {
  if (filterType === "all") return true;
  if (filterType === "image") return item.type === "image";
  if (filterType === "video") return item.type === "video";
  if (filterType === "premium") return item.premium === true;
  return true;
}

function updateVisibleItems() {
  const query = searchBar.value.toLowerCase().trim();
  const active = document.querySelector(".filter-btn.active[data-filter]");
  const filterType = active ? active.getAttribute("data-filter") : "all";

  let hasResults = false;

  mediaItems.forEach((item) => {
    if (matchesSearch(item, query) && matchesFilter(item, filterType)) {
      item.element.style.display = "block";
      hasResults = true;
    } else {
      item.element.style.display = "none";
    }
  });

  noResults.style.display = hasResults ? "none" : "block";
}

searchBar.addEventListener("input", updateVisibleItems);

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateVisibleItems();
  });
});

// ===== SMOOTH SCROLL FOR NAV LINKS =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

// ===== PREVIEW MODAL =====
const previewModal = document.getElementById("previewModal");
const previewImage = document.getElementById("previewImage");
const previewVideo = document.getElementById("previewVideo");
const previewTitle = document.getElementById("previewTitle");
const previewPrice = document.getElementById("previewPrice");
const previewClose = document.getElementById("previewClose");
const previewDownloadBtn = document.getElementById("previewDownloadBtn");

let currentPreviewBox = null;

mediaBoxes.forEach((box) => {
  box.addEventListener("click", () => {
    currentPreviewBox = box;

    const title = box.getAttribute("data-title") || "Untitled";
    const priceText =
      box.querySelector(".media-price")?.textContent || "Free";
    const type = box.getAttribute("data-type");

    previewTitle.textContent = title;
    previewPrice.textContent = `Price: ${priceText}`;

    if (type === "video") {
      const srcEl = box.querySelector("video source");
      if (srcEl) {
        previewVideo.src = srcEl.src;
        previewVideo.style.display = "block";
        previewImage.style.display = "none";
        previewVideo.load();
        previewVideo.play();
      }
    } else {
      const img = box.querySelector("img");
      if (img) {
        previewImage.src = img.src;
        previewImage.style.display = "block";
        previewVideo.style.display = "none";
        previewVideo.pause();
        previewVideo.removeAttribute("src");
      }
    }

    previewModal.classList.add("open");
  });
});

function closePreviewModal() {
  previewModal.classList.remove("open");
  previewVideo.pause();
  currentPreviewBox = null;
}

previewClose.addEventListener("click", closePreviewModal);

previewModal.addEventListener("click", (e) => {
  if (e.target === previewModal) closePreviewModal();
});

// ===== DOWNLOAD LOGIC (FREE vs PAID DEMO) =====
const downloadButtons = document.querySelectorAll(".download-btn");

downloadButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const box = btn.closest(".media-box");
    if (!box) return;
    handleDownloadForBox(box);
  });
});

previewDownloadBtn.addEventListener("click", () => {
  if (!currentPreviewBox) {
    alert("No media selected.");
    return;
  }
  handleDownloadForBox(currentPreviewBox);
});

function handleDownloadForBox(box) {
  const isFree = box.getAttribute("data-is-free") === "true";
  const downloadUrl = box.getAttribute("data-download-url");

  if (!downloadUrl) {
    alert("Download is not available for this item yet.");
    return;
  }

  if (isFree) {
    triggerDownload(downloadUrl);
  } else {
    handlePaidDownload(downloadUrl, box);
  }
}

function triggerDownload(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function handlePaidDownload(downloadUrl, box) {
  const title = box.getAttribute("data-title") || "this item";
  const ok = confirm(
    `“${title}” is a paid asset.\n\n` +
      `In a real app you would now be redirected to a payment gateway.\n` +
      `Press OK to simulate successful payment and start download.`
  );
  if (ok) triggerDownload(downloadUrl);
  else alert("Payment was cancelled. Download not started.");
}

// ===== LOGIN DEMO (Gmail + OTP) =====
let generatedOTP = null;

function handleGmailSignIn() {
  alert("Redirecting to Gmail sign-in (demo only).");
}

function handlePhoneSignIn() {
  const phone = prompt("Enter your phone number for OTP login:");
  if (!phone) {
    alert("Phone number is required for OTP login.");
    return;
  }

  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  alert("Your OTP is: " + generatedOTP + " (demo only, not real SMS)");

  const userOTP = prompt("Enter the OTP sent to your number:");
  if (userOTP === generatedOTP) {
    alert("Login successful via OTP!");
  } else {
    alert("Invalid OTP. Please try again.");
  }

  generatedOTP = null;
}