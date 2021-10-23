
"use strict"

// =====================================================================
// Variables
// =====================================================================
let insideCanvas = false;
canvas.addEventListener("mouseover", () => insideCanvas = true);
canvas.addEventListener("mouseleave", () => insideCanvas = false);

const controls = {
   up: "z",
   down: "s",
   left: "q",
   right: "d",
   run: " ",
}

const playerCommand = (event, state) => {
   let controlsLength = Object.keys(controls).length;

   for(let i = 0; i < controlsLength; i++) {
      
      let ctrlPair = Object.entries(controls)[i];
      let ctrlKey = ctrlPair[0];
      let ctrlValue = ctrlPair[1];
      
      if(event.key === ctrlValue) socket.emit(ctrlKey, state);
   }   
}


// =====================================================================
// Movements
// =====================================================================
window.addEventListener("keydown", (event) => {
   let state = true;
   if(insideCanvas) playerCommand(event, state);
});

window.addEventListener("keyup", (event) => {
   let state = false;
   playerCommand(event, state);
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
// Animation
// =====================================================================
let isDeathScreen = false;

const drawPlayer = (player, ctx) => {
   
   // ========== Player ==========
   ctx.fillStyle = player.color; // <== Debug Mode
   ctx.beginPath();
   ctx.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();


   // ========== PLayer Health ==========
   ctx.fillStyle = "black";
   ctx.font = "30px Orbitron-Regular";
   ctx.fillText(Math.floor(player.health), player.x - 35, player.y);


   // ========== Enemy Damage Taken ==========
   if(player.isGettingDamage) {

      const offsetX = -30;
      const offsetY = -30;
      const textSize = 30;
      const textColor = "yellow";
      const textValue = `-${player.damageValue}`;

      const newMessage = new FloatingMessage(ctx, player.x, player.y, offsetX, offsetY, textSize, textColor, textValue);
      floatTextArray.push(newMessage);
   }

   
   // ========== Death Screen ==========
   if(player.isDead && !isDeathScreen) {
      isDeathScreen = true;
      socket.emit("death", player.id);
   }
}