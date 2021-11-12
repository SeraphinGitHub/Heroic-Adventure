
"use strict"

// =====================================================================
// Player Enter Game
// =====================================================================
const socket = io();
socket.emit("playerName", logFormInput.value);
logFormInput.value = "";


// =====================================================================
// Canvas
// =====================================================================
const canvasMap = document.querySelector(".canvas-map");
const canvasChars = document.querySelector(".canvas-characters");
const canvasUI = document.querySelector(".canvas-UI");

// Set Contexts
const ctxMap = canvasMap.getContext("2d");
const ctxChars = canvasChars.getContext("2d");
const ctxUI = canvasUI.getContext("2d");

canvasMap.height = height;
canvasMap.width = width;

canvasChars.height = height;
canvasChars.width = width;

canvasUI.height = height;
canvasUI.width = width;

// Disabled Anti-Aliasing
ctxChars.imageSmoothingEnabled = false;
ctxChars.webkitImageSmoothingEnabled = false;
ctxChars.imageSmoothingEnabled = false;


// =====================================================================
// Chatting
// =====================================================================
const generalBtn = document.querySelector(".general-chat-btn");
const generalChat = document.querySelector(".general-chat");

const privateBtn = document.querySelector(".private-chat-btn");
const privateChat = document.querySelector(".private-chat");

const chatEnter = document.querySelector(".chat-enter");
const chatInput = document.querySelector(".chat-enter input");
const clearChatBtn = document.querySelector(".clear-chat-btn");

generalBtn.addEventListener("click", () => {
   generalChat.style = "z-index: 10";
   privateChat.style = "z-index: 0";
});

privateBtn.addEventListener("click", () => {
   generalChat.style = "z-index: 0";
   privateChat.style = "z-index: 10";
});

chatEnter.addEventListener("submit", (event) => {
   event.preventDefault();
   if(chatInput.value[0] === "/") socket.emit("evalServer", chatInput.value.slice(1));
   else if(chatInput.value !== "") socket.emit("sendMessage", chatInput.value);
   chatInput.value = "";
});

clearChatBtn.addEventListener("click", () => {
   for (let i = 0; i < generalChat.children.length; i++) {
      generalChat.children[i].remove();
      i--;
   }
});

const chatResponse = (data) => generalChat.innerHTML += `<p class="message">${data}</p>`;
const message = document.getElementsByClassName("message");


// ========== Temporary ==> Dev ==========
socket.emit("sendMessage", logFormInput.value + "Hello wolrd !");
// ========== Temporary ==> Dev ==========


socket.on("addMessage", (data) => {
   chatResponse(data);

   for(let i = 0; i < message.length; i++) {
      message[i].addEventListener("mousedown", (event) => {

         if(event.which === 1) console.log( message[i].textContent.split(" : ")[0] ); // <== Return player's name
      });
   }
});

socket.on("evalResponse", (data) => chatResponse(data));


// =====================================================================
// Inside Canvas & Chatting Detection
// =====================================================================
let insideCanvas = false;
canvasUI.addEventListener("mouseover", () => insideCanvas = true);
canvasUI.addEventListener("mouseleave", () => insideCanvas = false);

let isChatting = false;
chatInput.addEventListener("focusin", () => isChatting = true);
chatInput.addEventListener("focusout", () => isChatting = false);


// =====================================================================
// Floating Text
// =====================================================================
let floatTextArray = [];

const handleFloatingText = () => {

   floatTextArray.forEach(text => {
      text.drawText();
      
      if(text.displayDuration <= 0) {
         let textIndex = floatTextArray.indexOf(text);
         floatTextArray.splice(textIndex, 1);
         textIndex--;
      }
   });
}


// =====================================================================
// Client Sync (Every frame)
// =====================================================================
let mapLoaded = false;

socket.on("clientConnected", () => {
   socket.on("newSituation", (playerData) => {
      
      if(!mapLoaded) {
         initMap();
         setTimeout(() => mapLoaded = true, 1000);
      }
      
      ctxChars.clearRect(0, 0, canvasChars.width, canvasChars.height);
      playerData.forEach(player => initPlayer(player));
      handleFloatingText();
   
      if(showFPS) frameRate++;
   });
});



// =====================================================================
// Toggle Frame Rate
// =====================================================================
let showFPS = false;
let frameRate = 0;

setInterval(() => {
   if(showFPS) {
      console.log(frameRate);
      frameRate = 0;
   }
}, 1000);