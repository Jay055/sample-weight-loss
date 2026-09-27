const treatments = {
  weekly: {
    title: "Weekly treatment option",
    intro: "A placeholder page showing how a prescription treatment could be explained clearly before a consultation.",
    what: "Production copy would describe the approved indication, how the treatment is used, common side effects and key safety information."
  },
  alternative: {
    title: "Alternative weekly option",
    intro: "A second example pathway, designed to show how customers can compare treatment information without being pushed directly into a purchase.",
    what: "This section would use clinically and legally approved content specific to the actual medicine offered."
  },
  programme: {
    title: "Clinician-led programme",
    intro: "A non-product pathway combining professional review with structured lifestyle support.",
    what: "The real programme description could cover consultations, nutrition support, check-ins, behavioural guidance and eligibility."
  }
};

const state = {age:null,height:175,weight:85,goal:null,activity:null};
let step = 1;

const modal = document.getElementById("treatmentModal");
const shell = document.getElementById("assessmentShell");
const progress = document.getElementById("progressBar");
const toast = document.getElementById("toast");

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2200);
}

document.querySelectorAll("[data-treatment]").forEach(button=>{
  button.addEventListener("click",()=>{
    const item = treatments[button.dataset.treatment];
    document.getElementById("treatmentTitle").textContent = item.title;
    document.getElementById("treatmentIntro").textContent = item.intro;
    document.getElementById("treatmentWhat").textContent = item.what;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden","false");
  });
});
document.querySelectorAll("[data-close-treatment]").forEach(el=>el.addEventListener("click",()=>{
  modal.classList.remove("open"); modal.setAttribute("aria-hidden","true");
}));

function renderStep(){
  document.querySelectorAll(".assessment-step").forEach(el=>el.classList.toggle("active",Number(el.dataset.step)===step));
  progress.style.width = Math.min(((step-1)/5)*100,100)+"%";
}
function startAssessment(){
  modal.classList.remove("open");
  shell.classList.add("open");
  shell.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  renderStep();
}
document.querySelectorAll("[data-start-assessment]").forEach(el=>el.addEventListener("click",startAssessment));
document.getElementById("closeAssessment").addEventListener("click",()=>{
  shell.classList.remove("open");
  shell.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
});

document.querySelectorAll(".choice").forEach(choice=>{
  choice.addEventListener("click",()=>{
    const field = choice.dataset.field;
    const group = choice.closest(".assessment-step");
    group.querySelectorAll('[data-field="'+field+'"]').forEach(x=>x.classList.remove("selected"));
    choice.classList.add("selected");
    state[field]=choice.dataset.value;
    group.querySelector(".assessment-next").disabled=false;
  });
});

document.querySelectorAll(".assessment-next").forEach(btn=>{
  btn.addEventListener("click",()=>{
    if(step<5){ step++; renderStep(); }
    else {
      step=6;
      document.getElementById("resultSummary").innerHTML =
        "<strong>Your answers</strong><br>"+
        "Age: "+(state.age||"—")+"<br>"+
        "Height: "+state.height+" cm<br>"+
        "Weight: "+state.weight+" kg<br>"+
        "Goal: "+(state.goal||"—")+"<br>"+
        "Activity: "+(state.activity||"—");
      renderStep();
    }
  });
});

const heightRange=document.getElementById("heightRange");
heightRange.addEventListener("input",e=>{
  state.height=Number(e.target.value);
  document.getElementById("heightValue").textContent=e.target.value;
});
const weightRange=document.getElementById("weightRange");
weightRange.addEventListener("input",e=>{
  state.weight=Number(e.target.value);
  document.getElementById("weightValue").textContent=e.target.value;
});

document.getElementById("restartAssessment").addEventListener("click",()=>{
  step=1;renderStep();
});
["professionalButton","resultProfessional"].forEach(id=>{
  document.getElementById(id).addEventListener("click",()=>{
    showToast("Demo only — this would open the approved consultation booking flow.");
  });
});
document.querySelectorAll("[data-product]").forEach(btn=>btn.addEventListener("click",()=>{
  showToast(btn.dataset.product+" — this would open the Shopify product page.");
}));

document.addEventListener("keydown",e=>{
  if(e.key==="Escape"){
    modal.classList.remove("open");
    shell.classList.remove("open");
    document.body.style.overflow="";
  }
});