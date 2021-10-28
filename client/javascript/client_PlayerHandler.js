
"use strict"

// =====================================================================
// Player Controls
// =====================================================================
const controls = {
   movements: {
      up: "z",
      down: "s",
      left: "q",
      right: "d",
      run: " ",
   },

   spells: {
      heal: "r",
   }
}


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
canvasChars.addEventListener("mouseover", () => insideCanvas = true);
canvasChars.addEventListener("mouseleave", () => insideCanvas = false);


// =====================================================================
// Movements & Abilities
// =====================================================================
let isCasting = false;

const playerCommand = (event, ctrlObj, state) => {
   let pairsArray = Object.entries(ctrlObj);
   
   pairsArray.forEach(pair => {
      let key = pair[0];
      let value = pair[1];

      if(event.key === value) {
         socket.emit(key, state);

         if(ctrlObj === controls.spells && isCasting !== state) {
            isCasting = state;
            socket.emit("casting", state);
         }
      }
   });
}

window.addEventListener("keydown", (event) => {
   if(insideCanvas) {

      const state = true;
      playerCommand(event, controls.movements, state);
      playerCommand(event, controls.spells, state);
   }
});

window.addEventListener("keyup", (event) => {
   const state = false;
   playerCommand(event, controls.movements, state);
   playerCommand(event, controls.spells, state);
});


// =====================================================================
// Attack
// =====================================================================
const playerAttackCommand = (event, state) => {
   if(event.which === 1 && insideCanvas) {
      socket.emit("attack", state);
      socket.emit("casting", state);
   }
}

window.addEventListener("mousedown", (event) => playerAttackCommand(event, true));
window.addEventListener("mouseup", (event) => playerAttackCommand(event, false));


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

   const barWidth = 110;
   const barHeight = 10;

   // Mana color on low mana
   let manaColor = "deepskyblue";
   if(player.mana < player.healCost) manaColor = "blue";
   
   // Set up Bar
   const healthBar = setBar("lime", player.baseHealth, player.health);
   const manaBar   = setBar(manaColor, player.baseMana, player.mana);
   const attackBar = setBar("red", player.baseGcD, player.speedGcD);
   const energyBar = setBar("gold", player.baseEnergy, player.energy);
   
   let gameBarArray = [
      healthBar,
      manaBar,
      attackBar,
      energyBar,
   ];
   
   let barGap = 0;
   let topOffset = -95;

   gameBarArray.forEach(bar => {
      if(player.isDead) bar.color = "gray";
      new GameBar(ctxChars, player.x, player.y, -barWidth/2, topOffset + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
      barGap += 12;
   });
}


// Temporary
const drawHealthNumber = (ctxChars, player) => {

   ctxChars.fillStyle = "black";
   ctxChars.font = "26px Orbitron-Regular";
   ctxChars.fillText(Math.floor(player.health), player.x -35, player.y -15);

   ctxChars.fillStyle = "black";
   ctxChars.font = "22px Orbitron-ExtraBold";
   ctxChars.fillText("id: " + player.id, player.x -30, player.y +70);
}


// =====================================================================
// Toggle Death Screen
// =====================================================================
const deathScreen = document.querySelector(".death-screen");
const deathMessage = document.querySelector(".death-message");
const respawnTimer = document.querySelector(".respawn-timer");

socket.on("playerDeath", (player) => {
   
   let textValue = "You died !";
   let timerValue = `Respawn in ${player.respawnTimer} sec`;

   if(player.deathCounts === 3) textValue = "You died again !";
   if(player.deathCounts === 6) textValue = "Wasted !";
   if(player.deathCounts === 9) textValue = "You died like a bitch !";

   deathScreen.style = "visibility: visible";
   deathMessage.textContent = textValue;
   respawnTimer.textContent = timerValue;
});

socket.on("playerRespawn", () => {
   deathScreen.style = "visibility: hidden";
});


// =====================================================================
// Player Floating Text
// =====================================================================
const playerFloatingText = (ctxChars, player, condition, textColor, textValue) => {
   if(condition) {
      
      const text = {
         offsetX: -35,
         offsetY: -100,
         textSize: 30,
      };

      const newMessage = new FloatingMessage(ctxChars, player.x, player.y, text.offsetX, text.offsetY, text.textSize, textColor, textValue);
      floatTextArray.push(newMessage);
   }
}


// =====================================================================
// Player Init (Every frame)
// =====================================================================
const initPlayer = (ctxChars, player) => {
   
   drawPlayer(ctxChars, player);
   drawAttackArea(ctxChars, player);
   drawBar(ctxChars, player);

   playerFloatingText(ctxChars, player, player.isHealing, "lime", `+${player.calcHealing}`);
   playerFloatingText(ctxChars, player, player.isGettingDamage, "gold", `-${player.calcDamage}`);

   drawHealthNumber(ctxChars, player);
}