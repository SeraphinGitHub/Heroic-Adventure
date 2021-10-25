
"use strict"

// =====================================================================
// Variables
// =====================================================================
let insideCanvas = false;
canvasChars.addEventListener("mouseover", () => insideCanvas = true);
canvasChars.addEventListener("mouseleave", () => insideCanvas = false);

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
const drawPlayer = (ctxChars, player) => {

   ctxChars.fillStyle = player.color; // <== Debug Mode
   ctxChars.beginPath();
   ctxChars.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctxChars.fill();
   ctxChars.closePath();
}


// ========== Attack Area ==========
const drawAttackArea = (ctxChars, player) => {

   ctxChars.fillStyle = player.attkColor; // <== Debug Mode
   ctxChars.beginPath();
   ctxChars.arc(player.x + player.attkOffset_X, player.y + player.attkOffset_Y, player.attkRadius, player.attkAngle, Math.PI * 2);
   ctxChars.fill();
   ctxChars.closePath();
}


// ========== Enemy Damage Taken ==========
const enemyDamageTaken = (ctxChars, player) => {
   if(player.isGettingDamage) {
      
      const dmg = {
         offsetX: -30,
         offsetY: -100,
         textSize: 30,
         textColor: "yellow",
         textValue: `-${player.calcDamage}`,
      };

      const newMessage = new FloatingMessage(ctxChars, player.x, player.y, dmg.offsetX, dmg.offsetY, dmg.textSize, dmg.textColor, dmg.textValue);
      floatTextArray.push(newMessage);
   }
}


// =====================================================================
// Draw Player Game Bars
// =====================================================================
const setBar = (color, maxValue, value) => {
   return { 
      color: color,
      maxValue: maxValue,
      value: value
   }
}

const drawBar = (ctxChars, player) => {

   const barWidth = 130;
   const barHeight = 12;

   const healthBar = setBar("lime", player.baseHealth, player.health);
   const manaBar   = setBar("dodgerblue", player.baseMana, player.mana);
   const attackBar = setBar("red", player.baseAttackCooldown, player.attackCooldown);
   const energyBar = setBar("gold", player.baseEnergy, player.energy);
   
   let gameBarArray = [
      energyBar,
      attackBar,
      manaBar,
      healthBar,
   ];
   
   let barGap = 0;
 
   gameBarArray.forEach(bar => {
      if(player.isDead) bar.color = "gray";
      new GameBar(ctxChars, player.x, player.y, -barWidth/2, -80 + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
      barGap -= 14;
   });
}


// Temporary
const drawHealthNumber = (ctxChars, player) => {

   ctxChars.fillStyle = "black";
   ctxChars.font = "26px Orbitron-Regular";
   ctxChars.fillText(Math.floor(player.health), player.x -35, player.y -15);
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
// Player Init (Every frame)
// =====================================================================
const initPlayer = (ctxChars, player) => {

   drawPlayer(ctxChars, player);
   drawAttackArea(ctxChars, player);
   enemyDamageTaken(ctxChars, player);

   drawBar(ctxChars, player);
   drawHealthNumber(ctxChars, player);
   
   playerDeath(player);
}