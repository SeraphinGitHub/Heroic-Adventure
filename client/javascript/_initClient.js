
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

logForm.addEventListener("submit", (event) => {
   event.preventDefault();
   formValidation();
});

logBtn.addEventListener("click", () => formValidation());


// =====================================================================
// Form Validation
// =====================================================================
const emptyFieldAlert = document.querySelector(".empty-field");
const invalidAlert = document.querySelector(".invalid-chars");
const minCharsAlert = document.querySelector(".min-chars");
const maxCharsAlert = document.querySelector(".max-chars");

// LETTER || letter || accent letters && No white space && minimum 4 characters 
const playerNameRegEx = new RegExp(/^[A-Za-zÜ-ü]+$/);

// Any special Characters || Numbers
const specialCharsRegEx = new RegExp(/^[!@#$%^&*\s-'_=0-9]+$/);

const formValidation = () => {
   const duration = 3000;

   // if Empty Field
   if(logFormInput.value === "") {
      emptyFieldAlert.classList.add("visible");
      setTimeout(() => emptyFieldAlert.classList.remove("visible"), duration);
   }

   // if player name is less than 4 characters
   else if(logFormInput.value.length < 4) {
      minCharsAlert.classList.add("visible");
      setTimeout(() => minCharsAlert.classList.remove("visible"), duration);
   }

   // if player name is more than 10 characters
   else if(logFormInput.value.length > 10) {
      maxCharsAlert.classList.add("visible");
      setTimeout(() => maxCharsAlert.classList.remove("visible"), duration);
   }

   // if pass player name RegEx (No special chars or space)
   else if(!playerNameRegEx.test(logFormInput.value)) {
      invalidAlert.classList.add("visible");
      setTimeout(() => invalidAlert.classList.remove("visible"), duration);
   }

   // if everything's fine ==> Connect Player
   else {
      logScreen.classList.add("hide_LogScreen");
      scripts.forEach(item => instantiate(item));
   }
}