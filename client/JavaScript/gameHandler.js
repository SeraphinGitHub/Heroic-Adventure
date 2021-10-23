
const canvas = document.querySelector(".canvas-1");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;


// =====================================================================
// Variables
// =====================================================================
const socket = io();

const up = "z";
const down = "s";
const left = "q";
const right = "d";


// =====================================================================
// Movements
// =====================================================================
window.addEventListener("keydown", (event) => {
   if(event.key === up) socket.emit("up", true);
   if(event.key === down) socket.emit("down", true);
   if(event.key === left) socket.emit("left", true);
   if(event.key === right) socket.emit("right", true);
});

window.addEventListener("keyup", (event) => {
   if(event.key === up) socket.emit("up", false);
   if(event.key === down) socket.emit("down", false);
   if(event.key === left) socket.emit("left", false);
   if(event.key === right) socket.emit("right", false);
});


// =====================================================================
// Animation
// =====================================================================
socket.on("newPosition", (data) => {
   ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "red";
   for(let i = 0; i < data.length; i++) {
      ctx.fillRect(data[i].x, data[i].y, 80, 80);
   }
});



// =====================================================================
// Sync
// =====================================================================
// setInterval(() => {
//    socket.emit("newPosition", {
//       x: player.x,
//       y: player.y,
//    });
// }, 1000/30);