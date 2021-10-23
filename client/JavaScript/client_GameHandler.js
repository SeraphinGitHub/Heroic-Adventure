
"use strict"

// =====================================================================
// Socket & Canvas
// =====================================================================
const socket = io();
const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 700;


// =====================================================================
// Chatting
// =====================================================================
const chatBox = document.querySelector(".chat-box"); 
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector(".chat-form input");

let chatResponse = (data) => chatBox.innerHTML += `<p>${data}</p>`;

socket.on("addMessage", data => chatResponse(data));
socket.on("evalResponse", data => chatResponse(data));

chatForm.onsubmit = (event) => {
   event.preventDefault();
   if(chatInput.value[0] === "/") socket.emit("evalServer", chatInput.value.slice(1));
   else if(chatInput.value !== "") socket.emit("sendMessage", chatInput.value);
   chatInput.value = "";
}


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


// =====================================================================
// Client Sync
// =====================================================================
socket.on("newSituation", (playerData) => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   playerData.forEach(player => drawPlayer(player, ctx));
   handleFloatingMessages();
});

socket.on("deathScreen", (data) => {
   
   const aze = document.querySelector(".death-screen");
   aze.style = "visibility: visible";
});