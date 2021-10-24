
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
// Draw Player
// =====================================================================
const drawPlayer = (player, ctx) => {

   ctx.fillStyle = player.color; // <== Debug Mode
   ctx.beginPath();
   ctx.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();
}


// ========== Attack Area ==========
const drawAttackArea = (player, ctx) => {

   ctx.fillStyle = player.attkColor; // <== Debug Mode
   ctx.beginPath();
   ctx.arc(player.x + player.attkOffset_X, player.y + player.attkOffset_Y, player.attkRadius, player.attkAngle, Math.PI * 2);
   ctx.fill();
   ctx.closePath();
}


// ========== Enemy Damage Taken ==========
const enemyDamageTaken = (player, ctx) => {
   if(player.isGettingDamage) {
      
      const dmg = {
         offsetX: -30,
         offsetY: -100,
         textSize: 30,
         textColor: "yellow",
         textValue: `-${player.calcDamage}`,
      };

      const newMessage = new FloatingMessage(ctx, player.x, player.y, dmg.offsetX, dmg.offsetY, dmg.textSize, dmg.textColor, dmg.textValue);
      floatTextArray.push(newMessage);
   }
}


// =====================================================================
// Draw Player Game Bars
// =====================================================================
const drawBar = (player, ctx) => {

   const barWidth = 130;
   const barHeight = 12;

   const attackBar = {
      color: "red",
      maxValue: player.baseAttackCooldown,
      value: player.attackCooldown,
   };

   const healthBar = {
      color: "lime",
      maxValue: player.baseHealth,
      value: player.health,
   };

   const manaBar = {
      color: "dodgerblue",
      maxValue: player.baseMana,
      value: player.mana,
   };

   const energyBar = {
      color: "gold",
      maxValue: player.baseEnergy,
      value: player.energy,
   };
   
   let gameBarArray = [energyBar, attackBar, manaBar, healthBar];
   let barGap = 0;

   gameBarArray.forEach(bar => {
      new GameBar(ctx, player.x, player.y, -barWidth/2, -80 + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
      barGap -= 14;
   });
}


// Temporary
const drawHealthNumber = (player, ctx) => {

   ctx.fillStyle = "black";
   ctx.font = "26px Orbitron-Regular";
   ctx.fillText(Math.floor(player.health), player.x -35, player.y -15);
}


// =====================================================================
// Player Death
// =====================================================================
const deathScreen = document.querySelector(".death-screen");
const deathMessage = document.querySelector(".death-message");
const respawnTimer = document.querySelector(".respawn-timer");

const playerDeath = (player) => {

   if(player.isDead) {
      socket.emit("death", {
         id: player.id,
         timer: player.respawnTimer,
         deathCounts: player.deathCounts
      });
   }
   
   if(player.isRespawning) {
      socket.emit("respawn", player.id);
   }
}


// =====================================================================
// Toggle Death Screen
// =====================================================================
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


// =====================================================================
// Player Init (Update)
// =====================================================================
const initPlayer = (player, ctx) => {

   drawPlayer(player, ctx);
   drawAttackArea(player, ctx);
   enemyDamageTaken(player, ctx);

   drawBar(player, ctx);
   drawHealthNumber(player, ctx);
   
   playerDeath(player);
}