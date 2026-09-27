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
  if (event?.currentTarget) lastFocusedElement = event.currentTarget;
  modalShell.classList.remove("open");
  modalShell.setAttribute("aria-hidden", "true");
  assessmentShell.classList.add("open");
  assessmentShell.setAttribute("aria-hidden", "false");
  lockPage();
  renderStep();
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
    showToast("Prototype only — this will connect to the approved consultation flow in production.");
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

  if (assessmentShell.classList.contains("open")) {
    closeAssessment();
  } else if (modalShell.classList.contains("open")) {
    closeTreatment();
  }
});