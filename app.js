const treatments = {
  weekly: {
    title: "Weekly treatment option",
    intro: "A clear, education-first treatment page that explains the pathway before a visitor commits to a consultation.",
    what: "Production content would cover the medicine's approved indication, how it is used, common side effects, major safety information, and the clinical checks required before prescribing."
  },
  alternative: {
    title: "Alternative treatment option",
    intro: "A second example pathway showing how visitors can compare options without the website pretending to make a medical decision for them.",
    what: "The live version should use clinically and legally approved information specific to the actual medicine offered."
  },
  programme: {
    title: "Clinician-led programme",
    intro: "A support-led pathway for visitors who want structure, professional guidance, and sustainable behaviour change.",
    what: "The final programme page could explain consultations, nutrition support, check-ins, behavioural guidance, pricing, and what is included."
  }
};

const state = { age: null, height: 175, weight: 85, goal: null, activity: null };
let step = 1;
let lastFocusedElement = null;

const modalShell = document.getElementById("treatmentModal");
const modal = modalShell.querySelector(".modal");
const assessmentShell = document.getElementById("assessmentShell");
const progressBar = document.getElementById("progressBar");
const progressRoot = document.querySelector(".assessment-progress");
const toast = document.getElementById("toast");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function lockPage() {
  document.body.classList.add("locked");
}

function unlockPage() {
  if (!modalShell.classList.contains("open") && !assessmentShell.classList.contains("open")) {
    document.body.classList.remove("locked");
  }
}

function openTreatment(button) {
  const item = treatments[button.dataset.treatment];
  lastFocusedElement = button;
  document.getElementById("treatmentTitle").textContent = item.title;
  document.getElementById("treatmentIntro").textContent = item.intro;
  document.getElementById("treatmentWhat").textContent = item.what;
  modalShell.classList.add("open");
  modalShell.setAttribute("aria-hidden", "false");
  lockPage();
  window.setTimeout(() => modal.focus(), 0);
}

function closeTreatment() {
  modalShell.classList.remove("open");
  modalShell.setAttribute("aria-hidden", "true");
  unlockPage();
  lastFocusedElement?.focus();
}

document.querySelectorAll("[data-treatment]").forEach(button => {
  button.addEventListener("click", () => openTreatment(button));
});
document.querySelectorAll("[data-close-treatment]").forEach(el => {
  el.addEventListener("click", closeTreatment);
});

function renderStep() {
  document.querySelectorAll(".assessment-step").forEach(el => {
    el.classList.toggle("active", Number(el.dataset.step) === step);
  });

  const percentage = Math.min(((step - 1) / 5) * 100, 100);
  progressBar.style.width = percentage + "%";
  progressRoot.setAttribute("aria-valuenow", String(percentage));

  const activeStep = document.querySelector('.assessment-step[data-step="' + step + '"]');
  const firstControl = activeStep?.querySelector(".choice, input, .button:not(:disabled)");
  window.setTimeout(() => firstControl?.focus(), 40);
}

function startAssessment(event) {
  if (event) event.preventDefault();
  const message = "Hello LumiPharm, I'd like to start a weight-management consultation. Please let me know the next steps.";
  window.open("https://wa.me/2347013671959?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
}

function closeAssessment() {
  assessmentShell.classList.remove("open");
  assessmentShell.setAttribute("aria-hidden", "true");
  unlockPage();
  lastFocusedElement?.focus();
}

document.querySelectorAll("[data-start-assessment]").forEach(el => {
  el.addEventListener("click", startAssessment);
});
document.getElementById("closeAssessment").addEventListener("click", closeAssessment);

document.querySelectorAll(".choice").forEach(choice => {
  choice.addEventListener("click", () => {
    const field = choice.dataset.field;
    const group = choice.closest(".assessment-step");

    group.querySelectorAll('[data-field="' + field + '"]').forEach(item => {
      item.classList.remove("selected");
      item.setAttribute("aria-pressed", "false");
    });

    choice.classList.add("selected");
    choice.setAttribute("aria-pressed", "true");
    state[field] = choice.dataset.value;

    const next = group.querySelector(".assessment-next");
    if (next) next.disabled = false;
  });
});

document.querySelectorAll(".assessment-next").forEach(button => {
  button.addEventListener("click", () => {
    if (step < 5) {
      step += 1;
      renderStep();
      return;
    }

    step = 6;
    document.getElementById("resultSummary").innerHTML =
      "<strong>Your answers</strong><br>" +
      "Age: " + (state.age || "—") + "<br>" +
      "Height: " + state.height + " cm<br>" +
      "Weight: " + state.weight + " kg<br>" +
      "Goal: " + (state.goal || "—") + "<br>" +
      "Activity: " + (state.activity || "—");

    renderStep();
  });
});

const heightRange = document.getElementById("heightRange");
heightRange.addEventListener("input", event => {
  state.height = Number(event.target.value);
  document.getElementById("heightValue").textContent = event.target.value;
});

const weightRange = document.getElementById("weightRange");
weightRange.addEventListener("input", event => {
  state.weight = Number(event.target.value);
  document.getElementById("weightValue").textContent = event.target.value;
});

document.getElementById("restartAssessment").addEventListener("click", () => {
  step = 1;
  renderStep();
});

["professionalButton", "resultProfessional"].forEach(id => {
  document.getElementById(id).addEventListener("click", () => {
    const message = "Hello LumiPharm, I'd like to speak with a healthcare professional about weight-management options. Please let me know the next steps.";
    window.open("https://wa.me/2347013671959?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
  });
});

document.querySelectorAll("[data-product]").forEach(button => {
  button.addEventListener("click", () => {
    showToast(button.dataset.product + " — this will open the Shopify product page.");
  });
});

document.querySelectorAll(".product-image-link").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    const card = link.closest(".product-card");
    card.querySelector("[data-product]")?.click();
  });
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;

  if (contactShell?.classList.contains("open")) {
    closeContactOptions();
  } else if (assessmentShell.classList.contains("open")) {
    closeAssessment();
  } else if (modalShell.classList.contains("open")) {
    closeTreatment();
  }
});

function getActiveOverlay() {
  if (assessmentShell.classList.contains("open")) return assessmentShell;
  if (modalShell.classList.contains("open")) return modalShell;
  return null;
}

document.addEventListener("keydown", event => {
  if (event.key !== "Tab") return;

  const overlay = getActiveOverlay();
  if (!overlay) return;

  const focusable = [...overlay.querySelectorAll(
    'button:not([disabled]), a[href]:not([tabindex="-1"]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter(element => element.offsetParent !== null);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});


// Expandable strength and price panels in the treatment category grid.
document.querySelectorAll("[data-category-toggle]").forEach(button => {
  button.addEventListener("click", () => {
    const key = button.dataset.categoryToggle;
    const panel = document.querySelector('[data-category-panel="' + key + '"]');
    if (!panel) return;
    const wasOpen = button.getAttribute("aria-expanded") === "true";
    document.querySelectorAll("[data-category-panel]").forEach(item => { item.hidden = true; });
    document.querySelectorAll("[data-category-toggle]").forEach(item => {
      item.setAttribute("aria-expanded", "false");
      const arrow = item.querySelector(".category-arrow");
      if (arrow) arrow.textContent = "＋";
    });
    if (!wasOpen) {
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      const arrow = button.querySelector(".category-arrow");
      if (arrow) arrow.textContent = "−";
      panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
    }
  });
});
document.querySelectorAll("[data-category-close]").forEach(button => {
  button.addEventListener("click", () => {
    const panel = button.closest("[data-category-panel]");
    if (panel) panel.hidden = true;
    const key = panel?.dataset.categoryPanel;
    const trigger = document.querySelector('[data-category-toggle="' + key + '"]');
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.querySelector(".category-arrow").textContent = "＋";
      trigger.focus();
    }
  });
});

/* Contact options: direct WhatsApp or callback request handed off via WhatsApp. */
const contactShell = document.getElementById("contactShell");
const contactDialog = contactShell.querySelector(".contact-modal");
let contactReturnFocus = null;
function openContactOptions(event) {
  contactReturnFocus = event.currentTarget;
  contactShell.classList.add("open");
  contactShell.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  window.setTimeout(() => contactDialog.focus(), 0);
}
function closeContactOptions() {
  contactShell.classList.remove("open");
  contactShell.setAttribute("aria-hidden", "true");
  if (!modalShell.classList.contains("open") && !assessmentShell.classList.contains("open")) document.body.classList.remove("locked");
  contactReturnFocus?.focus();
}
document.querySelectorAll("[data-contact-options]").forEach(button => button.addEventListener("click", openContactOptions));
document.querySelectorAll("[data-close-contact]").forEach(button => button.addEventListener("click", closeContactOptions));
document.getElementById("callbackForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("callbackName").value.trim();
  const phone = document.getElementById("callbackPhone").value.trim();
  if (!name || !phone) return;
  const message = "Hello LumiPharm, I would like to request a callback when your team is available.\nName: " + name + "\nPhone: " + phone;
  window.open("https://wa.me/2347013671959?text=" + encodeURIComponent(message), "_blank", "noopener,noreferrer");
});
