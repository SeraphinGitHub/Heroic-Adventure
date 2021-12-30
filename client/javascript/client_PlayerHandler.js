
"use strict"

// =====================================================================
// Calculate player's Render Canvas 
// =====================================================================
const playerCtx = (player) => {
   // const playerRenderRange = Math.floor(canvasArray[0].height / canvasCharsNumber);
   // let canvasIndex = Math.floor(player.y / playerRenderRange);
   // let ctxIndexed = ctxArray[canvasIndex];

   // ***************************************************
   let ctxIndexed = ctxArray[0];
   // ***************************************************

   return ctxIndexed;
}


// =====================================================================
// Map Settings
// =====================================================================
const mapTile_3lands = new Image();
mapTile_3lands.src = "client/images/map/map_tile_3_lands.png";

const vpOffsetX = viewport.width/2;
const vpOffsetY = viewport.height/2;
const player_X = viewport.x + vpOffsetX;
const player_Y = viewport.y + vpOffsetY;

const cellSize = 200;
const spriteSize = 256;
const columns = 12;
const rows = 9;

const mapArray = [
   0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
   0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
   0, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 0,
   0, 1, 2, 1, 1, 2, 2, 1, 1, 2, 1, 0,
   1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1,
   0, 1, 2, 1, 1, 2, 2, 1, 1, 2, 1, 0,
   0, 1, 2, 2, 1, 2, 2, 1, 2, 2, 1, 0,
   0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
   0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0,
];


// =====================================================================
// Scroll Camera
// =====================================================================
const scrollCam = (player) => {

   let vpOriginX = Math.floor(viewport.x);
   let vpOriginY = Math.floor(viewport.y);
   let nbrOfCellX = Math.ceil(viewport.width) /cellSize;
   let nbrOfCellY = Math.ceil(viewport.height) /cellSize;

   for(let x = vpOriginX; x < nbrOfCellX; x++) {
      for(let y = vpOriginY; y < nbrOfCellY; y++) {
         
         let index = y * columns + x;
         let value = mapArray[index];
         
         ctxMap.drawImage(mapTile_3lands,
            value * spriteSize, 0, spriteSize, spriteSize,
            x * cellSize - player.x + vpOffsetX,
            y * cellSize - player.y + vpOffsetY,
            cellSize,
            cellSize
         );
      }
   }
}


// =====================================================================
// DOM Player UI
// =====================================================================
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

const playerScore = (data) => {
   const playerScore = document.querySelector(".player-score");

   // Player score
   const kills = playerScore.querySelector(".kills");
   const died = playerScore.querySelector(".died");

   // Set DOM text content
   kills.textContent = `Kills: ${data.kills}`;
   died.textContent = `Died: ${data.died}`;
}

const initPlayerUI = (socket) => {

   socket.on("playerStats", (data) => playerStats(data));
   socket.on("playerScore", (data) => playerScore(data));
}


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
// Movements & Abilities
// =====================================================================
let isCasting = false;

const playerCommand = (socket, event, ctrlObj, state) => {
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

const onKeyboardInput = (socket) => {

   window.addEventListener("keydown", (event) => {
      if(insideCanvas && !isChatting) {
   
         const state = true;
         playerCommand(socket, event, controls.movements, state);
         playerCommand(socket, event, controls.spells, state);
      }
   });
   
   window.addEventListener("keyup", (event) => {
      const state = false;
      playerCommand(socket, event, controls.movements, state);
      playerCommand(socket,event, controls.spells, state);
   });
}


// =====================================================================
// Attack
// =====================================================================
const playerAttackCommand = (socket, event, state) => {
   if(event.which === 1 && insideCanvas && !isChatting) {
      socket.emit("attack", state);
   }
}

const onMouseInput = (socket) => {

   window.addEventListener("mousedown", (event) => playerAttackCommand(socket, event, true));
   window.addEventListener("mouseup", (event) => playerAttackCommand(socket, event, false));
}


// =====================================================================
// Player Floating Text
// =====================================================================
const playerFloatingText = (player, textColor, textValue) => {

   const text = {
      offsetX: -35,
      offsetY: -117,
      textSize: 30,
   };

   const newText = new FloatingText(
      playerCtx(player),
      player_X,
      player_Y,
      text.offsetX,
      text.offsetY,
      text.textSize,
      textColor,
      textValue
   );

   floatTextArray.push(newText);
}

const toggleFloatingText = (socket) => {

   socket.on("getHeal", (player) => playerFloatingText(player, "lime", `+${player.calcHealing}`));
   socket.on("giveDamage", (player) => playerFloatingText(player, "yellow", `-${player.calcDamage}`));
   socket.on("getDamage", (player) => playerFloatingText(player, "red", `-${player.calcDamage}`));
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
      new GameBar(playerCtx(player), player.x, player.y, -barWidth/2, topOffset + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
      new GameBar(ctxUI, 100, 150, -barWidth/2, topOffset + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
      barGap += 11;
   });
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

   let ctxIndexed = playerCtx(player);
   
   // Player Shadow
   ctxIndexed.fillStyle = "rgba(30, 30, 30, 0.6)";
   ctxIndexed.beginPath();
   ctxIndexed.ellipse(
      player_X,
      player_Y + sprites.radius,
      sprites.radius * 0.8,
      sprites.radius * 0.4,
      0, 0, Math.PI * 2
   );
   ctxIndexed.fill();
   ctxIndexed.closePath();

   // Player
   ctxIndexed.drawImage(
      animImg,
      player.frameX * sprites.width,
      player.frameY * sprites.height,
      sprites.width,
      sprites.height,
      player_X - sprites.height/2,
      player_Y - sprites.width/2 - sprites.offsetY,
      sprites.height,
      sprites.width,
   );
}

const drawPlayerName = (player) => {
      
   const namePos = {
      x: player_X - (player.name.length * 6),
      y: player_Y + 85,
   };
   
   let ctxIndexed = playerCtx(player);

   ctxIndexed.fillStyle = "lime";
   ctxIndexed.font = "22px Orbitron-ExtraBold";
   ctxIndexed.fillText(player.name, namePos.x, namePos.y);
   ctxIndexed.strokeText(player.name, namePos.x, namePos.y);
}


// =====================================================================
// Player Animation State
// =====================================================================
const playerAnimPath = "client/images/playerAnimation/";

const animSrc = {
   idle: playerAnimPath + "idle_4x.png",
   walk: playerAnimPath + "walk_4x.png",
   run: playerAnimPath + "run_4x.png",
   attack: playerAnimPath + "attack2_4x.png",
   heal: playerAnimPath + "hurt_4x.png",
   died: playerAnimPath + "died_4x.png",
}

let animArray = [];
for(let state in animSrc) {

   const animation = new Image();
   animation.src = animSrc[state];
   animArray.push(animation);
}

const playerAnimState = (player) => {

   switch(player.state) {
      case "walk":
         drawPlayer(player, animArray[1]);
      break;

      case "run":
         drawPlayer(player, animArray[2]);
      break;

      case "attack":
         drawPlayer(player, animArray[3]);
      break;

      case "heal":
         drawPlayer(player, animArray[4]);
      break;

      case "died":
         drawPlayer(player, animArray[5]);
      break;

      default:
         drawPlayer(player, animArray[0]);
      break;
   }
}


// =====================================================================
// ==>  Debug Mode  <==
// =====================================================================
const drawPlayer_DebugMode = (player) => {
   let ctxIndexed = playerCtx(player);
   
   ctxIndexed.fillStyle = "darkviolet";
   ctxIndexed.beginPath();
   ctxIndexed.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
   ctxIndexed.fill();
   ctxIndexed.closePath();
}

const drawAttackArea_DebugMode = (player) => {
   let ctxIndexed = playerCtx(player);

   ctxIndexed.fillStyle = "orangered";
   ctxIndexed.beginPath();
   ctxIndexed.arc(player.x + player.attkOffset_X, player.y + player.attkOffset_Y, player.attkRadius, 0, Math.PI * 2);
   ctxIndexed.fill();
   ctxIndexed.closePath();
}

const drawHealthNumber_DebugMode = (player) => {
   let ctxIndexed = playerCtx(player);

   ctxIndexed.fillStyle = "black";
   ctxIndexed.font = "26px Orbitron-Regular";
   ctxIndexed.fillText(Math.floor(player.health), player.x -35, player.y -15);
}


// =====================================================================
// Toggle Death Screen
// =====================================================================
const toggleDeathScreen = (socket) => {

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
}


// =====================================================================
// Event Listeners
// =====================================================================
const playerEventListeners = (socket) => {
   
   onKeyboardInput(socket);
   onMouseInput(socket);
}


// =====================================================================
// Player Sync (Every frame)
// =====================================================================
const playerSync = (player) => {

   scrollCam(player);
   drawBar(player);
   drawPlayerName(player);

   drawPlayer_DebugMode(player);
   drawAttackArea_DebugMode(player);
   // drawHealthNumber_DebugMode(player);

   playerAnimState(player);
}


// =====================================================================
// Init Player
// =====================================================================
const initPlayer = (socket) => {

   initPlayerUI(socket);
   toggleFloatingText(socket)
   toggleDeathScreen(socket);
   playerEventListeners(socket);
}




