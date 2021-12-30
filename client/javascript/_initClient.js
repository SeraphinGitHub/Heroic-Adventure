
"use strict"


// =========================  Development  =========================
setTimeout(() => {
      
   const devID = Math.floor(Math.random() * 100);

   const socket = io();
   socket.emit("playerName", `ID: ${devID}`);
   // socket.emit("playerName", "Séraphin");
   initClientScripts(socket);
   
   logFormInput.blur();
   logScreen.style = `
      top: -600px !important;
      visibility: hidden !important;
      animation: none !important;
   `;

}, 200);
// =========================  Development  =========================



// =====================================================================
// Initiallize client scripts
// =====================================================================
const scripts = [
   
   // Classes
   "classes/FloatingText.js",
   "classes/GameBar.js",
   "classes/Tile.js",
   "classes/Viewport.js",
   
   // Scripts
   "client_Chat.js",
   "client_UI.js",

   // Handlers
   "client_GameHandler.js",
   "client_PlayerHandler.js",
];

const instantiate = (scriptName) => {
   const newScript = document.createElement("script");
   newScript.type = "text/javascript";
   newScript.src = `/client/javascript/${scriptName}`;
   document.body.insertAdjacentElement("afterend", newScript);
}

scripts.forEach(item => instantiate(item));

// =====================================================================
// Init Client Scripts
// =====================================================================
const initClientScripts = (socket) => {

   clientSync(socket);
   initChat(socket);
   initPlayer(socket);
}


// =====================================================================
// Login System
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
// Get Logged Player's Name
// =====================================================================
let logged_PlayerName;

const playerLogged = (socket) => {

   logged_PlayerName = logFormInput.value;
   socket.emit("playerName", logged_PlayerName);
   logFormInput.value = "";
}


// =====================================================================
// Pop Up Alert Message
// =====================================================================
const alertMessage = (messageClass) => {
   const duration = 2500;
   messageClass.classList.add("visible");
   setTimeout(() => messageClass.classList.remove("visible"), duration);
}


// =====================================================================
// Form Validation
// =====================================================================
const emptyFieldAlert = document.querySelector(".empty-field");
const invalidAlert = document.querySelector(".invalid-chars");
const whiteSpaceAlert = document.querySelector(".white-space");
const minCharsAlert = document.querySelector(".min-chars");
const maxCharsAlert = document.querySelector(".max-chars");

// if include: LETTER || letter || accent letters && No white space && minimum 4 characters 
const playerNameRegEx = new RegExp(/^[A-Za-zÜ-ü]+$/);

// if include: White Space
const includeSpaceRegEx = new RegExp(" ");

let isSocket = false;

const formValidation = () => {

   // if Empty Field
   if(logFormInput.value === "") alertMessage(emptyFieldAlert);

   // if player name is less than 4 characters
   else if(logFormInput.value.length < 4) alertMessage(minCharsAlert);

   // if player name is more than 10 characters
   else if(logFormInput.value.length > 10) alertMessage(maxCharsAlert);

   // if include white space
   else if(includeSpaceRegEx.test(logFormInput.value)) alertMessage(whiteSpaceAlert);

   // if include any special characters or number
   else if(!playerNameRegEx.test(logFormInput.value)) alertMessage(invalidAlert);

   // if everything's fine ==> Connect Player
   else if(!isSocket) {

      isSocket = true;
      const socket = io();
      playerLogged(socket);
      initClientScripts(socket);
      
      logFormInput.blur();
      logScreen.classList.add("hide_LogScreen");
   }
}