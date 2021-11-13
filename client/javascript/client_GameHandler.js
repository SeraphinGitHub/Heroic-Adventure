
"use strict"

// =====================================================================
// Player Enter Game
// =====================================================================
const socket = io();

const logged_PlayerName = logFormInput.value;
socket.emit("playerName", logged_PlayerName);
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
const privateBtn = document.querySelector(".private-chat-btn");
const generalChat = document.querySelector(".general-chat");
const privateChat = document.querySelector(".private-chat");

const chatEnter = document.querySelector(".chat-enter");
const chatInput = document.querySelector(".chat-enter input");
const clearChatBtn = document.querySelector(".clear-chat-btn");

const receiver = document.querySelector(".message-receiver");
const message = document.getElementsByClassName("message");

let isGeneralChat = true;
let isPrivateChat = false;

const showGeneralChat = () => {
   generalChat.style = "z-index: 10";
   privateChat.style = "z-index: 0";
   isGeneralChat = true;
   isPrivateChat = false;
}

const showPrivateChat = () => {
   generalChat.style = "z-index: 0";
   privateChat.style = "z-index: 10";
   isGeneralChat = false;
   isPrivateChat = true;
}

const getPlayerNameFromChat = (chatChannel, data) =>{
   chatChannel.innerHTML += `<p class="message">${data}</p>`;

   for(let i = 0; i < message.length; i++) {
      message[i].addEventListener("mousedown", (event) => {

         if(event.which === 1) {
            const playerName = message[i].textContent.split(": ")[0];

            if(!playerName.includes(logged_PlayerName)) {

               socket.emit("chatPlayerName", playerName);
               receiver.textContent = `Send to : ${playerName}`;
               chatInput.value = "";
               showPrivateChat();
            }
         }
      });
   }
}

const clearChat = (chatChannel) => {
   for (let i = 0; i < chatChannel.children.length; i++) {
      chatChannel.children[i].remove();
      i--;
   }
}

generalBtn.addEventListener("click", () => showGeneralChat());
privateBtn.addEventListener("click", () => showPrivateChat());

chatEnter.addEventListener("submit", (event) => {
   event.preventDefault();
   if(chatInput.value[0] === "/") socket.emit("evalServer", chatInput.value.slice(1));
   
   else if(chatInput.value !== "") {

      if(isGeneralChat) {
         socket.emit("generalMessage", chatInput.value);
         chatInput.value = "";
      }
      
      if(isPrivateChat && receiver.textContent !== "") {
         socket.emit("privateMessage", chatInput.value);
         chatInput.value = "";
      }
   }
});

clearChatBtn.addEventListener("click", () => {
   if(isGeneralChat) clearChat(generalChat);
   if(isPrivateChat) clearChat(privateChat);
});

socket.on("addMessage_General", (data) => getPlayerNameFromChat(generalChat, data));

socket.on("addMessage_Private", (data) => {
   getPlayerNameFromChat(privateChat, data);

   // if( "receiver" ) {
      privateBtn.style = "background: red";
      setTimeout(() => privateBtn.style = "background: orange", 200);
   // }
});

socket.on("evalResponse", (data) => generalChatResponse(data));


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

socket.on("newSituation", (playerData) => {
   
   if(!mapLoaded) {
      initMap();
      setTimeout(() => mapLoaded = true, 1000);
   }
   
   ctxChars.clearRect(0, 0, canvasChars.width, canvasChars.height);
   handleFloatingText();

   if(showFPS) frameRate++;
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