
"use strict"

// =====================================================================
// DOM Player UI
// =====================================================================

// ========== Player Stats ==========
const playerStats = (data) => {
   const playerName = document.querySelector(".player-name");
   const playerStats = document.querySelector(".player-stats");
   
   playerName.textContent = data.playerName;

   // Player infos
   const health = playerStats.querySelector(".health");
   const mana = playerStats.querySelector(".mana");
   const regenMana = playerStats.querySelector(".mana-regen");
   const energy = playerStats.querySelector(".energy");
   const regenEnergy = playerStats.querySelector(".energy-regen");
   const GcD = playerStats.querySelector(".GcD");

   // Set DOM text content
   health.textContent = `Health: ${data.health}`;
   mana.textContent = `Mana: ${data.mana}`;
   regenMana.textContent = `Regen mana: ${data.regenMana}`;
   energy.textContent = `Energy: ${data.energy}`;
   regenEnergy.textContent = `Regen energy: ${data.regenEnergy}`;
   GcD.textContent = `GcD: ${data.GcD}`;
}

// Init Player UI
socket.on("playerStats", (data) => {
   playerStats(data);
});


// ========== Player Score ==========
const playerScore = (data) => {
   const playerScore = document.querySelector(".player-score");

   // Player score
   const kills = playerScore.querySelector(".kills");
   const died = playerScore.querySelector(".died");

   // Set DOM text content
   kills.textContent = `Kills: ${data.kills}`;
   died.textContent = `Died: ${data.died}`;
}

// Init Player Score
socket.on("playerScore", (data) => {
   playerScore(data);
});


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
   }
}

window.addEventListener("mousedown", (event) => playerAttackCommand(event, true));
window.addEventListener("mouseup", (event) => playerAttackCommand(event, false));


// =====================================================================
// Player Floating Text
// =====================================================================
const playerFloatingText = (player, condition, textColor, textValue) => {
   if(condition) {
      
      const text = {
         offsetX: -35,
         offsetY: -117,
         textSize: 30,
      };

      const newText = new FloatingText(ctxChars, player.x, player.y, text.offsetX, text.offsetY, text.textSize, textColor, textValue);
      floatTextArray.push(newText);
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

const drawBar = (player) => {

   const barWidth = 110;
   const barHeight = 9;

   // Mana color on low mana
   let manaColor = "deepskyblue";
   if(player.mana < player.healCost) manaColor = "blue";
   
   // Set up Bar
   const healthBar = setBar("lime", player.baseHealth, player.health);
   const manaBar   = setBar(manaColor, player.baseMana, player.mana);
   const attackBar = setBar("red", player.GcD, player.speedGcD);
   const energyBar = setBar("gold", player.baseEnergy, player.energy);
   
   let gameBarArray = [
      healthBar,
      manaBar,
      attackBar,
      energyBar,
   ];
   
   let barGap = 0;
   let topOffset = -110;

   gameBarArray.forEach(bar => {
      if(player.isDead) bar.value = 0;
      new GameBar(ctxChars, player.x, player.y, -barWidth/2, topOffset + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
      barGap += 11;
   });
}


// =====================================================================
// Player Animation State
// =====================================================================
const idle = new Image();
idle.src = "client/images/playerAnimation/idle_4x.png"; // <== Idle Anim

const walk = new Image();
walk.src = "client/images/playerAnimation/walk_4x.png"; // <== Walk Anim

const run = new Image();
run.src = "client/images/playerAnimation/run_4x.png"; // <== Run Anim

const attack = new Image();
attack.src = "client/images/playerAnimation/attack2_4x.png"; // <== Attack Anim

const playerAnimState = (player) => {

   switch(player.state) {
      case "walk":
         drawPlayer(player, walk);
      break;

      case "run":
         drawPlayer(player, run);
      break;

      case "attack":
         drawPlayer(player, attack);
      break;

      default:
         drawPlayer(player, idle);
      break;
   }
}


// =====================================================================
// Draw Player
// =====================================================================
const drawPlayer = (player, animImg) => {

   const sprites = {
      height: 200,
      width: 200,
      offsetY: 5,
      radius: 45,
   }

   // Player Shadow
   ctxChars.fillStyle = "rgba(30, 30, 30, 0.6)";
   ctxChars.beginPath();
   ctxChars.ellipse(player.x, player.y + sprites.radius, sprites.radius * 0.8, sprites.radius * 0.4, 0, 0, Math.PI * 2);
   ctxChars.fill();
   ctxChars.closePath();

   // Player
   ctxChars.drawImage(
      animImg,
      player.frameX * player.spriteWidth,
      player.frameY * player.spriteHeight,
      player.spriteWidth,
      player.spriteHeight,
      player.x - sprites.height * 0.5,
      player.y - sprites.width * 0.5 - sprites.offsetY,
      sprites.height,
      sprites.width,
   );   
}

const drawPlayerName = (player) => {

   const namePos = {
      x: player.x - (player.name.length * 6),
      y: player.y + 85,
   };
   
   ctxChars.fillStyle = "lime";
   ctxChars.font = "22px Orbitron-ExtraBold";
   ctxChars.strokeText(player.name, namePos.x, namePos.y);
   ctxChars.fillText(player.name, namePos.x, namePos.y);
}


// =====================================================================
// ==>  Debug Mode  <==
// =====================================================================
const drawPlayer_DebugMode = (player) => {

   ctxChars.fillStyle = player.color;
   ctxChars.beginPath();
   ctxChars.arc(player.x, player.y, player.radius, player.angle, Math.PI * 2);
   ctxChars.fill();
   ctxChars.closePath();
}

const drawAttackArea_DebugMode = (player) => {

   ctxChars.fillStyle = player.attkColor;
   ctxChars.beginPath();
   ctxChars.arc(player.x + player.attkOffset_X, player.y + player.attkOffset_Y, player.attkRadius, player.attkAngle, Math.PI * 2);
   ctxChars.fill();
   ctxChars.closePath();
}

const drawHealthNumber_DebugMode = (player) => {

   ctxChars.fillStyle = "black";
   ctxChars.font = "26px Orbitron-Regular";
   ctxChars.fillText(Math.floor(player.health), player.x -35, player.y -15);
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
// Player Init (Every frame)
// =====================================================================
const initPlayer = (player) => {

   // ctxChars.shadowColor = "black";
   // ctxChars.shadowBlur = 6;

   drawBar(player);
   drawPlayerName(player);

   // drawPlayer_DebugMode(player);
   // drawAttackArea_DebugMode(player);
   // drawHealthNumber_DebugMode(player);

   playerAnimState(player);

   playerFloatingText(player, player.isHealing, "lime", `+${player.calcHealing}`);
   playerFloatingText(player, player.isGettingDamage, "yellow", `-${player.calcDamage}`);
}


// =====================================================================
// Player Sync (Every frame)
// =====================================================================
socket.on("newSituation", (playerData) => {
   playerData.forEach(player => initPlayer(player));
});