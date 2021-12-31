
"use strict"

// =====================================================================
// Map Settings
// =====================================================================
const mapTiles = new Image();
mapTiles.src = "client/images/map/map_tile_3_lands.png";

const cellSize = 180;
const spriteSize = 256;
const columns = 12;
const rows = 9;

const mapScheme = [
   1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1,
   1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
   1, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2, 1,
   1, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 1,
   2, 2, 2, 2, 3, 3, 3, 3, 2, 2, 2, 2,
   1, 2, 3, 2, 2, 2, 2, 2, 2, 3, 2, 1,
   1, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2, 1,
   1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1,
   1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1,
];


// =====================================================================
// Scroll Camera
// =====================================================================
const scrollCam = (player) => {

   viewport.scrollTo(player.x, player.y);
   
   // Viewport bounderies
   let vpLeftCol_Nbr = Math.floor(viewport.x / cellSize);
   let vpRightCol_Nbr = Math.ceil((viewport.x + viewport.width) / cellSize);
   let vpTopRow_Nbr = Math.floor(viewport.y / cellSize);
   let vpBottomRow_Nbr = Math.ceil((viewport.y + viewport.height) / cellSize);

   // Map bounderies ==> no repeat
   if(vpLeftCol_Nbr < 0) vpLeftCol_Nbr = 0;
   if(vpTopRow_Nbr < 0) vpTopRow_Nbr = 0;
   if(vpRightCol_Nbr > columns) vpRightCol_Nbr = columns;
   if(vpBottomRow_Nbr > rows) vpBottomRow_Nbr = rows;
   
   // ======== Temporary ========
   ctxPlayer.strokeStyle = "black";
   ctxPlayer.strokeRect(centerVp_X, centerVp_Y, viewport.width, viewport.height);
   // ======== Temporary ========

   for(let x = vpLeftCol_Nbr; x < vpRightCol_Nbr; x++) {
      for(let y = vpTopRow_Nbr; y < vpBottomRow_Nbr; y++) {
         
         let tileIndex = y * columns + x;
         let tileToDraw = mapScheme[tileIndex];
         
         let tile_X = x * cellSize - viewport.x + centerVp_X;
         let tile_Y = y * cellSize - viewport.y + centerVp_Y;
         
         ctxMap.drawImage(mapTiles,
            (tileToDraw -1) * spriteSize, 0, spriteSize, spriteSize,
            tile_X, tile_Y, cellSize, cellSize
         );

         // ==> Still need to hide other players and enemies when leave viewport
      }
   }
}


const pos = (player, coord) => {
   
   if(viewport_HTML.id === String(player.id)) {
      if(coord === "x") return viewSize.width/2;
      if(coord === "y") return viewSize.height/2;
   }

   else {
      if(coord === "x") return player.x - viewport.x;
      if(coord === "y") return player.y - viewport.y;
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

   const newText = new FloatingText(ctxPlayer,
      pos(player,"x"),
      pos(player,"y"),
      text.offsetX, text.offsetY, text.textSize, textColor, textValue
   );

   floatTextArray.push(newText);
}

const floatingText = (socket) => {

   socket.on("getHeal", (player) => playerFloatingText(player, "lime", `+${player.calcHealing}`));
   socket.on("giveDamage", (player) => playerFloatingText(player, "yellow", `-${player.calcDamage}`));
   socket.on("getDamage", (player) => playerFloatingText(player, "red", `-${player.calcDamage}`));
}


// =====================================================================
// Player Game Bars
// =====================================================================
const barSpecs = (color, maxValue, value) => {
   return { 
      color: color,
      maxValue: maxValue,
      value: value
   }
}

const drawBars = (player) => {

   // Mana color on low mana
   let manaColor = "deepskyblue";
   if(player.mana < player.healCost) manaColor = "blue";
   
   // Set up Bar
   const healthBar = barSpecs("lime", player.baseHealth, player.health);
   const manaBar   = barSpecs(manaColor, player.baseMana, player.mana);
   const attackBar = barSpecs("red", player.GcD, player.speedGcD);
   const energyBar = barSpecs("gold", player.baseEnergy, player.energy);
   
   const gameBarArray = [
      healthBar,
      manaBar,
      attackBar,
      energyBar,
   ];
   
   // Player Bars
   if(viewport_HTML.id === String(player.id)) {
         
      const barWidth = 400;
      const barHeight = 10;

      // ========== Health ==========
      new GameBar(ctxUI, 30, 30,
      0, 0, barWidth, barHeight, healthBar.color, healthBar.maxValue, healthBar.value).draw();
      

      // ========== Mana ==========
      new GameBar(ctxUI, 30, 42,
      0, 0, barWidth, barHeight, manaBar.color, manaBar.maxValue, manaBar.value).draw();
      

      // ========== GcD ==========
      const GcDwh = 120;
      new GameBar(ctxUI, viewSize.width/2 - GcDwh/2, viewSize.height/2 - 85,
      0, 0, GcDwh, 8, attackBar.color, attackBar.maxValue, attackBar.value).draw();
      

      // ========== Energy ==========
      new GameBar(ctxUI, 30, 54,
      0, 0, barWidth, barHeight, energyBar.color, energyBar.maxValue, energyBar.value).draw();
   }
   
   let barGap = 0;

   gameBarArray.forEach(bar => {
      if(player.isDead) bar.value = 0;
      
      // Other Players Bars
      if(viewport_HTML.id !== String(player.id)) {

         const topOffset = -110;
         const barWidth = 110;
         const barHeight = 9;
         
         new GameBar(ctxPlayer, player.x - viewport.x, player.y - viewport.y, -barWidth/2, topOffset + barGap, barWidth, barHeight, bar.color, bar.maxValue, bar.value).draw();
         barGap += 11;
      }
   });
}


// =====================================================================
// Draw Player, Shadow & Name
// =====================================================================
const sprites = {
   height: 200,
   width: 200,
   offsetY: 5,
   radius: 45,
}

const drawShadow = (player) => {
   
   ctxPlayer.fillStyle = "rgba(30, 30, 30, 0.6)";
   ctxPlayer.beginPath();
   ctxPlayer.ellipse(
      pos(player,"x"),
      pos(player,"y") + sprites.radius,
      sprites.radius * 0.8, sprites.radius * 0.4, 0, 0, Math.PI * 2
   );
   ctxPlayer.fill();
   ctxPlayer.closePath();
}

const drawPlayer = (player, animImg) => {

   ctxPlayer.drawImage(
      animImg,
      player.frameX * sprites.width, player.frameY * sprites.height, sprites.width, sprites.height,      
      pos(player,"x") - sprites.width/2,
      pos(player,"y") - sprites.height/2 - sprites.offsetY,
      sprites.height, sprites.width,
   );
}

const drawName = (player) => {
   
   let offsetY = 90;
   let namePos_X = pos(player,"x") - (player.name.length * 6);
   let namePos_Y = pos(player,"y") + offsetY;
   
   ctxPlayer.fillStyle = "lime";
   ctxPlayer.font = "22px Orbitron-ExtraBold";
   ctxPlayer.fillText(player.name, namePos_X, namePos_Y);
   ctxPlayer.strokeText(player.name, namePos_X, namePos_Y);
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
   
   let animState;

   switch(player.state) {
      case "walk": animState = animArray[1];
      break;

      case "run": animState = animArray[2];
      break;

      case "attack": animState = animArray[3];
      break;

      case "heal": animState = animArray[4];
      break;

      case "died": animState = animArray[5];
      break;

      default: animState = animArray[0];
      break;
   }

   drawPlayer(player, animState);
}


// =====================================================================
// Death Screen
// =====================================================================
const deathScreen = (socket) => {

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
// Player Sync (Every frame)
// =====================================================================
const playerSync = (player) => {

   if(viewport_HTML.id === String(player.id)) {
      scrollCam(player);
   }
   
   drawBars(player);
   drawShadow(player);
   drawName(player);
   playerAnimState(player);

   // DEBUG_DrawPlayer(player);
   // DEBUG_DrawAttackArea(player);
   // DEBUG_DrawHealthNumber(player);
}


// =====================================================================
// Init Player
// =====================================================================
const initPlayer = (socket) => {

   socket.on("playerID", (id) => viewport_HTML.id = id);

   initPlayerUI(socket);
   floatingText(socket)
   deathScreen(socket);
   onKeyboardInput(socket);
   onMouseInput(socket);
}




// =====================================================================
// ==>  DEBUG MODE  <==
// =====================================================================
const DEBUG_DrawPlayer = (player) => {
   
   ctxPlayer.fillStyle = "darkviolet";
   ctxPlayer.beginPath();
   ctxPlayer.arc( pos(player,"x"), pos(player,"y"), player.radius, 0, Math.PI * 2);
   ctxPlayer.fill();
   ctxPlayer.closePath();
}

const DEBUG_DrawAttackArea = (player) => {

   ctxPlayer.fillStyle = "orangered";
   ctxPlayer.beginPath();
   ctxPlayer.arc( pos(player,"x") + player.attkOffset_X, pos(player,"y") + player.attkOffset_Y, player.attkRadius, 0, Math.PI * 2);
   ctxPlayer.fill();
   ctxPlayer.closePath();
}

const DEBUG_DrawHealthNumber = (player) => {

   ctxPlayer.fillStyle = "black";
   ctxPlayer.font = "26px Orbitron-Regular";
   ctxPlayer.fillText(Math.floor(player.health), pos(player,"x") -35, pos(player,"y") -15);
}