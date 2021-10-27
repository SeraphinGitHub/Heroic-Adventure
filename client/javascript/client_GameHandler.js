
"use strict"

// =====================================================================
// Socket & Canvas
// =====================================================================
const socket = io();

const gameWindow = document.querySelector(".game-window");
const canvasMap = document.querySelector(".canvas-map");
const canvasChars = document.querySelector(".canvas-characters");

const ctxMap = canvasMap.getContext("2d");
const ctxChars = canvasChars.getContext("2d");

canvasMap.height = 800;
canvasMap.width = 1200;

canvasChars.height = 800;
canvasChars.width = 1200;

// if(window.matchMedia("(max-width: 1500px)").matches) {
//    canvas.height = 500;
//    canvas.width = 800;
// }

gameWindow.style = `
   height: ${canvasChars.height}px;
   width: ${canvasChars.width}px
`;


// =====================================================================
// Chatting
// =====================================================================
const chatDisplayMess = document.querySelector(".chat-display-mess");
const chatEnter = document.querySelector(".chat-enter");
const chatInput = document.querySelector(".chat-enter input");
const clearChatBtn = document.querySelector(".clear-chat-btn");

const clearChat = () => {
   for (let i = 0; i < chatDisplayMess.children.length; i++) {
      chatDisplayMess.children[i].remove();
      i--;
   }
}

const chatResponse = (data) => chatDisplayMess.innerHTML += `<p class="message">${data}</p>`

socket.on("addMessage", data => chatResponse(data));
socket.on("evalResponse", data => chatResponse(data));

chatEnter.onsubmit = (event) => {
   event.preventDefault();
   if(chatInput.value[0] === "/") socket.emit("evalServer", chatInput.value.slice(1));
   else if(chatInput.value !== "") socket.emit("sendMessage", chatInput.value);
   chatInput.value = "";
}

clearChatBtn.addEventListener("click", () => clearChat());


// =====================================================================
// Floating Messages
// =====================================================================
let floatTextArray = [];

const handleFloatingMessages = () => {
   for(let i = 0; i < floatTextArray.length; i++) {
      
      let message = floatTextArray[i];
      message.update();
      message.draw();
      
      if(message.displayDuration <= 0) {
         floatTextArray.splice(i, 1);
         i--;
      }
   }
}


// ==========================  Temporary  ==========================

// socket.on("treeList", (treeList) => initMap(ctxMap, treeList));

// ==========================  Temporary  ==========================



// =====================================================================
// Client Sync (Every frame)
// =====================================================================
if(canvasChars && canvasMap) {
   
   socket.on("newSituation", (playerData) => {
      ctxChars.clearRect(0, 0, canvasChars.width, canvasChars.height);
      
      initMap(ctxMap); // <== Disactivate on update later
      
      playerData.forEach(player => initPlayer(ctxChars, player));
      handleFloatingMessages();
   
      if(showFPS) frameRate++;
   });
}


// =====================================================================
// Toggle Frame Rate
// =====================================================================
// let showFPS = true; // <== delete this one 
let showFPS = false;
let frameRate = 0;

setInterval(() => {
   if(showFPS) {
      console.log(frameRate);
      frameRate = 0;
   }
}, 1000);