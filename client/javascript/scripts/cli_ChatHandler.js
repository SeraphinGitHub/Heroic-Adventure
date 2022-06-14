
"use strict"

// =====================================================================
// Classes Variables
// =====================================================================
const chat = {
   window: document.querySelector(".player-chat"),
   chatGlowing: document.querySelector(".chat-glowing"),

   // Buttons
   generalBtn: document.querySelector(".general-plate"),
   privateBtn: document.querySelector(".private-plate"),
   clearChatBtn: document.querySelector(".clear-plate"),
   gotWhispPlate: document.querySelector(".got-whisp"),

   // Channels
   generalChat: document.querySelector(".general-chat"),
   privateChat: document.querySelector(".private-chat"),

   // Receiver Tag
   receiver: document.querySelector(".message-receiver"),
   message: document.getElementsByClassName("message"),
   
   // Input Field
   chatForm: document.querySelector(".chat-form"),
   chatInput: document.querySelector(".chat-form input"),
}


// =====================================================================
// Handling Functions
// =====================================================================
let isGeneralChat = true;
let isPrivateChat = false;

let worldContent = "Everyone";
let receiverContent = "";

const displayReceiverName = (receiverStr) => chat.receiver.textContent = receiverStr;

const showGeneralChat = () => {

   chat.generalChat.classList.add("visible");
   chat.privateChat.classList.remove("visible");
   chat.chatGlowing.classList.add("glow-purple");
   chat.chatGlowing.classList.remove("glow-orange");
   isGeneralChat = true;
   isPrivateChat = false;

   displayReceiverName(worldContent);
}

const showPrivateChat = () => {

   chat.generalChat.classList.remove("visible");
   chat.privateChat.classList.add("visible");
   chat.chatGlowing.classList.remove("glow-purple");
   chat.chatGlowing.classList.add("glow-orange");
   isGeneralChat = false;
   isPrivateChat = true;

   displayReceiverName(receiverContent);
}

const getPlayerMessage = (socket, chatChannel, textMessage) => {
   chatChannel.innerHTML += `<p class="message">${textMessage}</p>`;

   for(let i = 0; i < chat.message.length; i++) {
      let messageIndexed = chat.message[i];

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
      receiverContent = `To : ${receiverName}`;
      chat.chatInput.value = "";
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
// Chat System
// =====================================================================
const chatSystem = (socket) => {

   chat.window.addEventListener("mouseleave", () => chat.chatInput.blur());
   chat.generalBtn.addEventListener("click", () => showGeneralChat());
   chat.privateBtn.addEventListener("click", () => showPrivateChat());
   
   chat.chatForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if(chat.chatInput.value !== "") {
   
         if(isGeneralChat) {
            socket.emit("generalMessage", chat.chatInput.value);
            chat.chatInput.value = "";
         }
         
         if(isPrivateChat && chat.receiver.textContent !== "") {
            socket.emit("privateMessage", chat.chatInput.value);
            chat.chatInput.value = "";
         }
      }
   });
   
   chat.clearChatBtn.addEventListener("click", () => {
      if(isGeneralChat) clearChat(chat.generalChat);
      if(isPrivateChat) clearChat(chat.privateChat);
   });
}


// =====================================================================
// Chat Add Message
// =====================================================================
const chatAddMessage = (socket) => {
   
   socket.on("addMessage_General", (textMessage) => getPlayerMessage(socket, chat.generalChat, textMessage));

   socket.on("addMessage_Private", (textMessage) => {
      getPlayerMessage(socket, chat.privateChat, textMessage);
   
      if(!isPrivateChat) chat.gotWhispPlate.forEach(plate => {
         plate.classList.add("whisp-alert");
         setTimeout(() => plate.classList.remove("whisp-alert"), 1000);
      });
   });
}


// =====================================================================
// Init Chat
// =====================================================================
const initChat = (socket) => {

   chatAddMessage(socket)
   displayReceiverName(worldContent);
   chatSystem(socket);
}