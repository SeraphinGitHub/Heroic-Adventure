
"use strict"

// =====================================================================
// Classes Variables
// =====================================================================

// ========== Buttons ==========
const generalBtn = document.querySelector(".general-chat-btn");
const privateBtn = document.querySelector(".private-chat-btn");
const clearChatBtn = document.querySelector(".clear-chat-btn");

// ========== Channels ==========
const generalChat = document.querySelector(".general-chat");
const privateChat = document.querySelector(".private-chat");

// ========== Receiver Tag ==========
const receiver = document.querySelector(".message-receiver");
const message = document.getElementsByClassName("message");

// ========== Input Field ==========
const chatEnter = document.querySelector(".chat-enter");
const chatInput = document.querySelector(".chat-enter input");


// =====================================================================
// Handling Functions
// =====================================================================
let isChatting = false;

let isGeneralChat = true;
let isPrivateChat = false;

let worldContent = "Everyone";
let receiverContent = "";

const displayReceiverName = (receiverStr) => receiver.textContent = receiverStr;

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

const getPlayerMessage = (socket, chatChannel, textMessage) => {
   chatChannel.innerHTML += `<p class="message">${textMessage}</p>`;

   for(let i = 0; i < message.length; i++) {
      let messageIndexed = message[i];

      messageIndexed.addEventListener("mousedown", (event) => {
         if(event.which === 1) extractPlayerName(socket, messageIndexed);
      });
   }
}

const extractPlayerName = (socket, messageIndexed) => {
   const prefix = "To >";
   const offlineStr = "< Has gone offline !";
   const messageText = messageIndexed.textContent;
   
   let receiverName;
   let splitedName = messageText.split(": ")[0];
   
   if(splitedName.includes(prefix)) receiverName = splitedName.split(prefix)[1];
   else receiverName = splitedName;
   
   if(receiverName !== ""
   && receiverName !== logged_PlayerName
   && !messageText.includes(offlineStr)) {
      
      socket.emit("chatReceiverName", receiverName);
      receiverContent = `Send to : ${receiverName}`;
      chatInput.value = "";
      showPrivateChat();
   }
}

const clearChat = (chatChannel) => {
   for (let i = 0; i < chatChannel.children.length; i++) {
      chatChannel.children[i].remove();
      i--;
   }
}


// =====================================================================
// Event Listeners
// =====================================================================
const chatEventListeners = (socket) => {
   chatInput.addEventListener("focusin", () => isChatting = true);
   chatInput.addEventListener("focusout", () => isChatting = false);

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
}


// =====================================================================
// Chat Add Message
// =====================================================================
const chatAddMessage = (socket) => {

   socket.on("evalResponse", (textMessage) => generalChatResponse(textMessage));
   
   socket.on("addMessage_General", (textMessage) => getPlayerMessage(socket, generalChat, textMessage));

   socket.on("addMessage_Private", (textMessage) => {
      getPlayerMessage(socket, privateChat, textMessage);
   
      if(!isPrivateChat) privateBtn.classList.add("private-message-received");
      setTimeout(() => privateBtn.classList.remove("private-message-received"), 200);
   });
}


// =====================================================================
// Init Chat
// =====================================================================
const initChat = (socket) => {

   chatAddMessage(socket)
   displayReceiverName(worldContent);
   
   chatEventListeners(socket);
}