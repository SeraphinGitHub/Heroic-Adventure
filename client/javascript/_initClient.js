
"use strict"

// =====================================================================
// Canvas Size
// =====================================================================
const gameWindow = document.querySelector(".game-window");

const height = 800;
const width = 1200;

gameWindow.style = `
   height: ${height}px;
   width: ${width}px;
  background: linear-gradient(to bottom right, violet, white, violet);
`;


// =====================================================================
// Initiallize client scripts
// =====================================================================
const scripts = [
   
   // Classes
   "classes/FloatingText.js",
   "classes/GameBar.js",
   "classes/Tile.js",
   
   // Scripts
   "client_GameHandler.js",
   "client_PlayerHandler.js",
   "client_Map.js",
   "client_UI.js",
];

const instantiate = (scriptName) => {
   const newScript = document.createElement("script");
   newScript.type = "text/javascript";
   newScript.src = `/client/javascript/${scriptName}`;
   document.body.appendChild(newScript);
}


// =====================================================================
// Login Button
// =====================================================================
const logScreen = document.querySelector(".log-screen");
const logBtn = document.querySelector(".log-btn");
const logForm = document.querySelector(".log-form");
const logFormInput = logForm.querySelector("input");

logForm.onsubmit = (event) => event.preventDefault();
logBtn.addEventListener("click", () => formValidation());


// =====================================================================
// Login Validation
// =====================================================================
const emptyAlert = document.querySelector(".empty-alert");
const minCharsAlert = document.querySelector(".min-chars-alert");
const maxCharsAlert = document.querySelector(".max-chars-alert");

// Have to contain: LETTER || letter || accent letters && No white space && minimum 4 characters 
const playerNameRegEx = new RegExp(/^[A-Za-zÜ-ü*].{3,}$/);

const formValidation = () => {

   if(logFormInput.value === "") {
      emptyAlert.classList.add("visible");
      setTimeout(() => emptyAlert.classList.remove("visible"), 3000);
   }

   else if(!playerNameRegEx.test(logFormInput.value)) {
      minCharsAlert.classList.add("visible");
      setTimeout(() => minCharsAlert.classList.remove("visible"), 3000);
   }

   else if(logFormInput.value.length > 10) {
      maxCharsAlert.classList.add("visible");
      setTimeout(() => maxCharsAlert.classList.remove("visible"), 3000);
   }

   else {
      logScreen.classList.add("hide_LogScreen");
      scripts.forEach(item => instantiate(item));
   }
}