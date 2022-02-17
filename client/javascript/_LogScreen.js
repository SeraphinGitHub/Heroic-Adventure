
"use strict"


// =========================  Development  =========================
// CSS ==> logScreen l.12
// CSS ==> viewport l.154

const easyLogin = () => {
   
   setTimeout(() => {
      const socket = io();
      const logFormInput = document.querySelector(".log-form input");
   
      socket.emit("playerName", "Séraphin");
      loadClient(socket);
      logFormInput.blur();
   }, 100);
}

easyLogin();
// =========================  Development  =========================



// =====================================================================
// Init Client
// =====================================================================
const instantiate = (scriptName) => {
   const newScript = document.createElement("script");
   newScript.type = "text/javascript";
   newScript.src = `/client/javascript/${scriptName}`;
   document.body.insertAdjacentElement("beforeend", newScript);
}

// Instantiate client scripts
const initClientScripts = () => {

   const scripts = [
      
      // Classes
      "classes/ClientCharacter.js",
      "classes/ClientEnemy.js",
      "classes/ClientPlayer.js",
      "classes/FloatingText.js",
      "classes/GameBar.js",
      "classes/Tile.js",
      "classes/Viewport.js",
      
      // Scripts
      "client_PlayerHandler.js",
      "client_MapHandler.js",
      "client_ChatHandler.js",
      
      // Game Handler (Last)
      "client_GameHandler.js",
   ];

   scripts.forEach(script => {
      const initPromise = new Promise((resolve, reject) => resolve(script));
   
      initPromise
      .then((item) => instantiate(item))
      .catch(() => console.log(`${script} could not be loaded !`));
   });
}

// Load Client
const loadClient = (socket) => {

   initPlayer(socket);
   initChat(socket);
   clientUpdate();
}


// =====================================================================
// Login System
// =====================================================================
const logFormInput = document.querySelector(".log-form input");
let isSocket = false;
let logged_PlayerName;

// Login Form & Button
const loginForm = () => {

   const logBtn = document.querySelector(".log-btn");
   const logForm = document.querySelector(".log-form");
   
   logForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formValidation();
   });
   
   logBtn.addEventListener("click", () => {
      formValidation();
   });
}

// Get Logged Player's Name
const loggedPlayer = (socket) => {
   
   logged_PlayerName = logFormInput.value;
   socket.emit("playerName", logged_PlayerName);
   setTimeout(() => logFormInput.value = "", 200);
}

// Form Validation
const formValidation = () => {
   
   const logScreen = document.querySelector(".log-screen");
   const emptyFieldAlert = document.querySelector(".empty-field");
   const invalidAlert = document.querySelector(".invalid-chars");
   const whiteSpaceAlert = document.querySelector(".white-space");
   const minCharsAlert = document.querySelector(".min-chars");
   const maxCharsAlert = document.querySelector(".max-chars");
   
   // if include: LETTER || letter || accent letters && No white space && minimum 4 characters 
   const playerNameRegEx = new RegExp(/^[A-Za-zÜ-ü]+$/);
   
   // if include: White Space
   const includeSpaceRegEx = new RegExp(" ");


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
      loggedPlayer(socket);
      loadClient(socket);
      
      logFormInput.blur();
      logScreen.classList.add("hide-LogScreen");
   }
}

// Pop Up Alert Messages
const alertMessage = (messageClass) => {
   const duration = 2500;
   messageClass.classList.add("visible");
   setTimeout(() => messageClass.classList.remove("visible"), duration);
}


// =====================================================================
// Window OnLoad
// =====================================================================
window.addEventListener("load", () => {
   
   initClientScripts();
   loginForm();
});