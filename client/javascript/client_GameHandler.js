
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
let worldContent = "Everyone";
let receiverContent = "";


// ========== Functions Declarations ==========
const displayReceiverName = (receiverStr) => receiver.textContent = receiverStr;
displayReceiverName(worldContent);

const showGeneralChat = () => {

   generalChat.style = "z-index: 10";
   privateChat.style = "z-index: 0";
   isGeneralChat = true;
   isPrivateChat = false;

   displayReceiverName(worldContent);
}

const showPrivateChat = () => {

   generalChat.style = "z-index: 0";
   privateChat.style = "z-index: 10";
   isGeneralChat = false;
   isPrivateChat = true;

   displayReceiverName(receiverContent);
}

const getPlayerNameFromChat = (chatChannel, textMessage) => {
   chatChannel.innerHTML += `<p class="message">${textMessage}</p>`;

   for(let i = 0; i < message.length; i++) {
      let messageIndexed = message[i];

      messageIndexed.addEventListener("mousedown", (event) => {
         if(event.which === 1) {
            
            const prefix = "To >";
            const offlineStr = "< Has gone offline !";
            const messageText = messageIndexed.textContent;
            
            let receiverName;
            let splitedName = messageText.split(": ")[0];
            
            if(splitedName.includes(prefix)) receiverName = splitedName.split(prefix)[1];
            else receiverName = splitedName;

            if(messageText.includes(offlineStr)) return;
            else if(receiverName !== logged_PlayerName && receiverName !== "") {
               
               socket.emit("chatReceiverName", receiverName);
               receiverContent = `Send to : ${receiverName}`;
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


// ========== Buttons ==========
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


// ========== Sockets Event ==========
socket.on("addMessage_General", (textMessage) => {
   getPlayerNameFromChat(generalChat, textMessage);
});

socket.on("addMessage_Private", (textMessage) => {
   getPlayerNameFromChat(privateChat, textMessage);

   if(!isPrivateChat) privateBtn.classList.add("private-message-received");
   setTimeout(() => privateBtn.classList.remove("private-message-received"), 200);
});

socket.on("evalResponse", (textMessage) => generalChatResponse(textMessage));


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

socket.on("newSituation", () => {
   
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