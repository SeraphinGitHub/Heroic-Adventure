
"use strict"

// =========================  Development  =========================
const easyLogin = () => {
   
   setTimeout(() => {
      isSocket = true;

      const formInput = document.querySelector(".log-form input");
      const logScreen = document.querySelector(".log-screen");
      const logBackground = document.querySelector(".log-background");
      const navLeft = document.querySelector(".nav-left");
      const navRight = document.querySelector(".nav-right");
      const chat = document.querySelector(".player-chat");
      const leftBag = document.querySelector(".player-bag-left");
      const rightBag = document.querySelector(".player-bag-right");
      
      // Send player's name
      const socket = io();
      logged_PlayerName = "Séraphin";
      socket.emit("send_initClient", "Séraphin");
      
      // Await for server response
      socket.on("received_initClient", (playerID) => {

         initMap();
         initChat(socket);
         initPanelsUI(socket);
         initGameUI(socket);
         initPlayer(socket, playerID);

         clientUpdate();

         // Reset inputField's value
         formInput.value = ""
         formInput.blur();

         logScreen.classList.add("hide-LogScreen");
         logBackground.classList.add("hide-LogScreen");
         navLeft.classList.remove("hide-nav-left");
         navRight.classList.remove("hide-nav-right");
         chat.classList.remove("hide-chat");
         leftBag.classList.remove("hide-bag");
         rightBag.classList.remove("hide-bag");
      });
   }, 300);
}

easyLogin();
// =========================  Development  =========================


const removeIndex = (array, item) => {
   let index = array.indexOf(item);
   array.splice(index, 1);
   index--;
}


// =====================================================================
// Init Scripts
// =====================================================================
const instantiate = (scriptName) => {
   const newScript = document.createElement("script");
   newScript.type = "text/javascript";
   newScript.src = `/client/javascript/${scriptName}`;
   document.body.insertAdjacentElement("beforeend", newScript);
}

const initClientScripts = () => {

   const scripts = [

      // Classes
      "classes/ClientEnemy.js",
      "classes/ClientPlayer.js",
      "classes/FloatingText.js",
      "classes/Fluidity.js",
      "classes/GameBar.js",
      "classes/Tile.js",

      // Scripts
      "scripts/cli_MapHandler.js",
      "scripts/cli_ChatHandler.js",
      "scripts/cli_PanelsUI.js",
      "scripts/cli_ViewportHandler.js",
      "scripts/cli_GameUI.js",

      // Player Handler (BeforeLast)
      "scripts/cli_PlayerHandler.js",
      
      // Game Handler (Last)
      "_ClientGameHandler.js",
   ];

   scripts.forEach(script => instantiate(script));
}


// =====================================================================
// Login System
// =====================================================================
let logged_PlayerName = "";
let isSocket = false;

const loginForm = () => {

   const logForm = document.querySelector(".log-form");
   const logBtn = document.querySelector(".log-plate");
   
   logForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formValidation();
   });
   
   logBtn.addEventListener("click", () => {
      formValidation();
   });
}

const formValidation = () => {
   
   const formInput = document.querySelector(".log-form input");
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
   if(formInput.value === "") alertMessage(emptyFieldAlert);

   // if player name is less than 4 characters
   else if(formInput.value.length < 4) alertMessage(minCharsAlert);

   // if player name is more than 10 characters
   else if(formInput.value.length > 12) alertMessage(maxCharsAlert);

   // if include white space
   else if(includeSpaceRegEx.test(formInput.value)) alertMessage(whiteSpaceAlert);

   // if include any special characters or number
   else if(!playerNameRegEx.test(formInput.value)) alertMessage(invalidAlert);

   // if everything's fine ==> Connect Player
   else if(!isSocket) loadClient(formInput);
}

const loadClient = (formInput) => {
   
   isSocket = true;

   const logScreen = document.querySelector(".log-screen");
   const logBackground = document.querySelector(".log-background");
   const navLeft = document.querySelector(".nav-left");
   const navRight = document.querySelector(".nav-right");
   const chat = document.querySelector(".player-chat");
   const leftBag = document.querySelector(".player-bag-left");
   const rightBag = document.querySelector(".player-bag-right");
   
   // Send player's name
   const socket = io();

   logged_PlayerName = formInput.value;
   socket.emit("send_initClient", formInput.value);
   
   // Await for server response
   socket.on("received_initClient", (playerID) => {

      initMap();
      initChat(socket);
      initPanelsUI(socket);
      initGameUI(socket);
      initPlayer(socket, playerID);

      clientUpdate();

      setTimeout(() => {
         // Reset inputField's value
         formInput.value = ""
         formInput.blur();

         logScreen.classList.add("hide-LogScreen");
         logBackground.classList.add("hide-LogScreen");
         navLeft.classList.remove("hide-nav-left");
         navRight.classList.remove("hide-nav-right");
         chat.classList.remove("hide-chat");
         leftBag.classList.remove("hide-bag");
         rightBag.classList.remove("hide-bag");

      }, 500);
   });
}

const alertMessage = (messageClass) => {

   const duration = 2000;
   messageClass.classList.add("alert-slide");
   messageClass.parentElement.classList.add("visible");

   setTimeout(() => {
      messageClass.classList.remove("alert-slide");
      messageClass.parentElement.classList.remove("visible");
   }, duration);
}


// =====================================================================
// Window OnLoad
// =====================================================================
window.addEventListener("load", () => {
   
   initClientScripts();
   loginForm();
});