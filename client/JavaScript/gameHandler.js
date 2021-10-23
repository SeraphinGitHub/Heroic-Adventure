
// =====================================================================
// Global variables
// =====================================================================
const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 700;

const socket = io();

// Controls
const up = "z";
const down = "s";
const left = "q";
const right = "d";
const run = " ";

let isChatting = false;


// =====================================================================
// Movements
// =====================================================================
window.addEventListener("keydown", (event) => {
   if(!isChatting) {
      if(event.key === up) socket.emit("up", true);
      if(event.key === down) socket.emit("down", true);
      if(event.key === left) socket.emit("left", true);
      if(event.key === right) socket.emit("right", true);
      if(event.key === run) socket.emit("running", true);
   }
});
   
window.addEventListener("keyup", (event) => {
   if(!isChatting) {
      if(event.key === up) socket.emit("up", false);
      if(event.key === down) socket.emit("down", false);
      if(event.key === left) socket.emit("left", false);
      if(event.key === right) socket.emit("right", false);
      if(event.key === run) socket.emit("running", false);
   }
});


// =====================================================================
// Animation
// =====================================================================
socket.on("newPosition", (data) => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   for(let i = 0; i < data.length; i++) {
      let player = data[i];
      
      ctx.fillStyle = "red";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      
      ctx.fillStyle = "black";
      ctx.font = "20px Verdana";
      ctx.fillText(Math.floor(player.health), player.x + 20, player.y + 30);
   }
});


// =====================================================================
// Chatting
// =====================================================================
const chatBox = document.querySelector(".chat-box"); 
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector(".chat-form input");

chatInput.addEventListener("click", () => isChatting = true);
canvas.addEventListener("click", () => isChatting = false);

socket.on("addMessage", (data) => {
   chatBox.innerHTML += `<p>${data}</p>`;
});

socket.on("evalResponse", (data) => {
   console.log(data);
});

chatForm.onsubmit = (event) => {
   event.preventDefault();
   if(chatInput.value[0] === "/") socket.emit("evalServer", chatInput.value.slice(1));
   else socket.emit("sendMessage", chatInput.value);
   chatInput.value = "";
}


// =====================================================================
// Sync
// =====================================================================
// setInterval(() => {
//    socket.emit("newPosition", {
//       x: player.x,
//       y: player.y,
//    });
// }, 1000/30);