
"use strict"


// =========================  Development  =========================
setTimeout(() => {
      
   const socket = io();
   socket.emit("playerName", "Séraphin");
   initClient(socket);
   
   logFormInput.blur();

}, 100);
// =========================  Development  =========================



// =====================================================================
// Initiallize client scripts
// =====================================================================
const scripts = [
   
   // Scripts
   "client_Classes.js",
   "client_Chat.js",

   // Handlers
   "client_GameHandler.js",
   "client_PlayerHandler.js",
   "client_MinotaursHandler.js",
];

const instantiate = (scriptName) => {
   const newScript = document.createElement("script");
   newScript.type = "text/javascript";
   newScript.src = `/client/javascript/${scriptName}`;
   document.body.insertAdjacentElement("beforeend", newScript);
}

scripts.forEach(item => instantiate(item));

// =====================================================================
// Init Client Scripts
// =====================================================================
const initClient = (socket) => {

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
   setTimeout(() => logFormInput.value = "", 200);
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
      initClient(socket);
      
      logFormInput.blur();
      logScreen.classList.add("hide-LogScreen");
   }
}