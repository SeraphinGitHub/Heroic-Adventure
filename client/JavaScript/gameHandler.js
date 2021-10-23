
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
// Animation
// =====================================================================
const deathScreen = document.querySelector(".death-screen");
// deathScreen.style = "visibility: visible";

const drawPlayer = (player, color) => {

   // Player Display
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();

   // Player Health Display
   ctx.fillStyle = "black";
   ctx.font = "30px Orbitron-Regular";
   ctx.fillText(Math.floor(player.health), player.x - 35, player.y);

   // Player Damage Taken Display
   if(player.displayDamage) {
      ctx.fillStyle = "yellow";
      ctx.font = "30px Orbitron-ExtraBold";
      ctx.fillText(`-${player.displayDamage}`, player.x - 35, player.y - 30);
   }
}

socket.on("newSituation", (playerData) => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   playerData.forEach(player => {
      // ========== temporary ==========
      if(!player.isDead) drawPlayer(player, "red");
      else drawPlayer(player, "blue");
   });
});