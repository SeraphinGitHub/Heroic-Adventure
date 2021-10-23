
"use strict"

// =====================================================================
// Global variables
// =====================================================================
const socket = io();
const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 700;

let insideCanvas = false;

canvas.addEventListener("mouseover", () => insideCanvas = true);
canvas.addEventListener("mouseleave", () => insideCanvas = false);


// =====================================================================
// Movements
// =====================================================================
const keyDownEvent = "keydown";
const keyUpEvent = "keyup";

const playerKeys = {
   up: "z",
   down: "s",
   left: "q",
   right: "d",
   run: " ",
}


const aze = (event, keyOn, eventString) => {
   if(event.key === keyOn) {

      let state;
      if(eventString === keyDownEvent) state = true;
      if(eventString === keyUpEvent) state = false;
      socket.emit(keyOn.keys, state);
   }
}

window.addEventListener(keyDownEvent, (event) => {
   if(insideCanvas) {
      // if(event.key === up) socket.emit("up", true);
      // if(event.key === down) socket.emit("down", true);
      // if(event.key === left) socket.emit("left", true);
      // if(event.key === right) socket.emit("right", true);
      // if(event.key === run) socket.emit("run", true);

      aze(event, playerKeys.up, keyDownEvent);
      aze(event, playerKeys.down, keyDownEvent);
      aze(event, playerKeys.left, keyDownEvent);
      aze(event, playerKeys.right, keyDownEvent);
      aze(event, playerKeys.run, keyDownEvent);
   }
});

window.addEventListener(keyUpEvent, (event) => {
   // if(event.key === up) socket.emit("up", false);
   // if(event.key === down) socket.emit("down", false);
   // if(event.key === left) socket.emit("left", false);
   // if(event.key === right) socket.emit("right", false);
   // if(event.key === run) socket.emit("run", false);

   aze(event, playerKeys.up, keyUpEvent);
      aze(event, playerKeys.down, keyUpEvent);
      aze(event, playerKeys.left, keyUpEvent);
      aze(event, playerKeys.right, keyUpEvent);
      aze(event, playerKeys.run, keyUpEvent);
});


// =====================================================================
// Attack
// =====================================================================
window.addEventListener("mousedown", (event) => {
   if(event && insideCanvas) socket.emit("attack", true);
});

window.addEventListener("mouseup", (event) => {
   if(event && insideCanvas) socket.emit("attack", false);
});


// =====================================================================
// Chatting
// =====================================================================
const chatBox = document.querySelector(".chat-box"); 
const chatForm = document.querySelector(".chat-form");
const chatInput = document.querySelector(".chat-form input");

let chatResponse = (data) => chatBox.innerHTML += `<p>${data}</p>`;

socket.on("addMessage", (data) => chatResponse(data));
socket.on("evalResponse", (data) => chatResponse(data));

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

const drawPlayer = (player, color) => {
   ctx.fillStyle = color;
   ctx.beginPath();
   ctx.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();

   ctx.fillStyle = "black";
   ctx.font = "30px Orbitron-Regular";
   ctx.fillText(Math.floor(player.health), player.x - 30, player.y - 10);
}

socket.on("newSituation", (data) => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);

   data.forEach(player => {

      // ========== temporary ==========
      if(!player.isDead) drawPlayer(player, "red");
      else drawPlayer(player, "blue");
      // ===============================
   });
});