
"use strict"

// =====================================================================
// Classes Variables
// =====================================================================
const chatGlowing = document.querySelector(".chat-glowing");

// ========== Buttons ==========
const generalBtn = document.querySelector(".general-plate");
const privateBtn = document.querySelector(".private-plate");
const clearChatBtn = document.querySelector(".clear-plate");

// ========== Channels ==========
const generalChat = document.querySelector(".general-chat");
const privateChat = document.querySelector(".private-chat");

// ========== Receiver Tag ==========
const receiver = document.querySelector(".message-receiver");
const message = document.getElementsByClassName("message");

// ========== Input Field ==========
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector(".chat-form input");


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

   generalChat.classList.add("visible");
   privateChat.classList.remove("visible");
   chatGlowing.classList.add("glow-purple");
   chatGlowing.classList.remove("glow-orange");
   isGeneralChat = true;
   isPrivateChat = false;

   displayReceiverName(worldContent);
}

const showPrivateChat = () => {

   generalChat.classList.remove("visible");
   privateChat.classList.add("visible");
   chatGlowing.classList.remove("glow-purple");
   chatGlowing.classList.add("glow-orange");
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
   // && receiverName !== logged_PlayerName
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
   
   chatForm.addEventListener("submit", (event) => {
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