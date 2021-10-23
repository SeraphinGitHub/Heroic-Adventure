
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
   heal: "r",
}

// Display Controls
const initMessage = [
   "== Welcome to ==",
   "Multi Player Arena",
   "",
   "[Attack: left click]",
   "[Heal: r]",
   "[Up: z]",
   "[Down: s]",
   "[Left: q]",
   "[Right: d]",
   "[Run: space bar]",
   "",
   "If you want to try,",
   "open another tab",
   "",
   "Enjoy =)",
];

initMessage.forEach(line => socket.emit("sendMessage", line));

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

// ========== Player ==========
const drawPlayer = (player, ctx) => {

   ctx.fillStyle = player.color; // <== Debug Mode
   ctx.beginPath();
   ctx.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();
}


// ========== Attack Area ==========
const drawAttackArea = (player, ctx) => {

   ctx.fillStyle = player.atkColor; // <== Debug Mode
   ctx.beginPath();
   ctx.arc(player.x + player.atkOffset_X, player.y + player.atkOffset_Y, player.atkRadius, player.atkAngle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();
}


// ========== Enemy Damage Taken ==========
const enemyDamageTaken = (player, ctx) => {
   if(player.isGettingDamage) {
      
      const offsetX = -30;
      const offsetY = -100;
      const textSize = 30;
      const textColor = "yellow";
      const textValue = `-${player.calcDamage}`;

      const newMessage = new FloatingMessage(ctx, player.x, player.y, offsetX, offsetY, textSize, textColor, textValue);
      floatTextArray.push(newMessage);
   }
}


let width = 130;
let height = 12;

// ========== HealthBar ==========
const drawHealthBar = (player, ctx) => {
   let color = "lime";
   const bar = new GameBar(ctx, player.x, player.y, -width/2, -108, width, height, color, player.baseHealth, player.health);
   bar.draw();

   ctx.fillStyle = "black";
   ctx.font = "26px Orbitron-Regular";
   ctx.fillText(Math.floor(player.health), player.x -35, player.y -15);
}


// ========== ManaBar ==========
const drawManaBar = (player, ctx) => {
   let color = "dodgerblue";
   if(player.isDead) color = "gray";
   const bar = new GameBar(ctx, player.x, player.y, -width/2, -94, width, height, color, player.baseMana, player.mana);
   bar.draw();
}


// ========== EnergBar ==========
const drawEnergyBar = (player, ctx) => {
   let color = "gold";
   if(player.isDead) color = "gray";
   const bar = new GameBar(ctx, player.x, player.y, -width/2, -80, width, height, color, player.baseEnergy, player.energy);
   bar.draw();
}


// =====================================================================
// Toggle Death Screen
// =====================================================================
const deathScreen = document.querySelector(".death-screen");
const deathMessage = document.querySelector(".death-message");
const respawnTimer = document.querySelector(".respawn-timer");

const playerDeathScreen = (player) => {

   if(player.isDead) socket.emit("death", {
      id: player.id,
      timer: player.respawnTimer,
      deathCounts: player.deathCounts,
   });

   if(player.isRespawning) socket.emit("respawn", player.id);
}

socket.on("showDeathScreen", (player) => {
   
   let textValue = "You died !";
   let timerValue = `Respawn in ${player.timer} sec`;

   if(player.deathCounts === 3) textValue = "You died again !";
   if(player.deathCounts === 6) textValue = "Wasted !";
   if(player.deathCounts === 9) textValue = "You died like a bitch !";

   deathScreen.style = "visibility: visible";
   deathMessage.textContent = textValue;
   respawnTimer.textContent = timerValue;
});

socket.on("hideDeathScreen", () => {
   deathScreen.style = "visibility: hidden";
});