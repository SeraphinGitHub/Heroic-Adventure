
"use strict"

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
   // ctxPlayer.strokeStyle = "black";
   // ctxPlayer.strokeRect(centerVp_X, centerVp_Y, viewport.width, viewport.height);
   // ======== Temporary ========

   for(let x = vpLeftCol_Nbr; x < vpRightCol_Nbr; x++) {
      for(let y = vpTopRow_Nbr; y < vpBottomRow_Nbr; y++) {
         
         let tileIndex = y * columns + x;
         let tileToDraw = mapScheme[tileIndex];
         
         let tile_X = x * cellSize - viewport.x + centerVp_X;
         let tile_Y = y * cellSize - viewport.y + centerVp_Y;
         
         ctxMap.drawImage(mapTiles,
            (tileToDraw -1) * mapSpriteSize, 0, mapSpriteSize, mapSpriteSize,
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
   const fame = playerScore.querySelector(".fame");
   const fameCount = playerScore.querySelector(".fame-count");

   // Set DOM text content
   kills.textContent = `Kills: ${data.kills}`;
   died.textContent = `Died: ${data.died}`;
   fame.textContent = `Fame: ${data.fame}`;
   fameCount.textContent = `F_Count: ${data.fameCount}`;
}

const initPlayerUI = (socket) => {

   socket.on("playerID", (id) => viewport_HTML.id = id);
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
const playerFloatingText = (player, textObj) => {
   
   const newText = new FloatingText(
      ctxPlayer,
      pos(player, "x"),
      pos(player, "y"),
      textObj.x,
      textObj.y,
      textObj.size,
      textObj.color,
      textObj.value
   );

   floatTextArray.push(newText);
}

const floatingText = (socket) => {
   
   const mainTexSize = 34;

   socket.on("getHeal", (player) => {

      const text = {
         x: -35,
         y: -100,
         size: mainTexSize,
         color: "lime",
         value: `+${player.calcHealing}`,
      }
      
      playerFloatingText(player, text);
   });

   socket.on("giveDamage", (player) => {

      const text = {
         x: -35,
         y: -100,
         size: mainTexSize,
         color: "yellow",
         value: `-${player.calcDamage}`,
      }
      
      playerFloatingText(player, text);
   });

   socket.on("getDamage", (player) => {
      const text = {
         x: -35,
         y: -100,
         size: mainTexSize,
         color: "red",
         value: `-${player.calcDamage}`,
      }
      
      playerFloatingText(player, text);
   });
   
   socket.on("getFame", (player, fameCost) => {
      const text = {
         x: -105,
         y: 180,
         size: mainTexSize,
         color: "darkviolet",
         value: `+${fameCost} Fame`,
      }
      
      playerFloatingText(player, text);
   });
   
   socket.on("looseFame", (player, fameCost) => {
      const text = {
         x: -105,
         y: 180,
         size: mainTexSize,
         color: "red",
         value: `-${fameCost} Fame`,
      }
      
      playerFloatingText(player, text);
   });
}


// =====================================================================
// Player HUD
// =====================================================================
const hudImage = new Image();
hudImage.src = "client/images/playerUI/HUD.png";

const scale_X = 1.2;
const scale_Y = 1;

const minHealthRatio = 0.3; // Min Health before flash (%)
const flashingSpeed = 6;
let flashFrame = 0;

const hud = {
   x: viewport.width/2 -400/2 *scale_X,
   y: viewport.height -110 *scale_Y,
   width: 400 *scale_X,
   height: 100 *scale_Y,
}

const drawHUD_Frame = () => {
   
   // Background
   ctxFixedBack.drawImage(hudImage,
      4, 179, 729, 141,
      hud.x + (15 *scale_X), // Pos X
      hud.y + (10 *scale_Y), // Pos Y
      hud.width - (30 *scale_X), // Width
      hud.height - (20 *scale_Y) // Height
   );

   // HUD Sprite
   ctxFixedFront.drawImage(hudImage,
      3, 4, 782, 172,
      hud.x, hud.y, hud.width, hud.height
   );
}

const drawHUD_BaseBar = (ratio, sx, sy, sw, sh, offX, offY, offW, offH) => {

   ctxUI.drawImage(hudImage,
      sx, sy, sw *ratio, sh,
      hud.x + (offX *scale_X), // Pos X
      hud.y + (offY *scale_Y), // Pos Y
      ( hud.width - (offW *scale_X) ) *ratio, // Width
      hud.height/3 - (offH *scale_Y) // Height
   );
}

const drawHUD_Mana = (player) => {
   
   let manaRatio = player.mana / player.baseMana;
   
   // Still Castable Mana
   if(player.mana >= player.healCost) {
      drawHUD_BaseBar(
         manaRatio,
         4, 382, 460, 47,
         82, 10, 165, 8
      );
   }
   
   // Low Mana
   else {
      drawHUD_BaseBar(
         manaRatio,
         3, 328, 462, 47,
         82, 10, 165, 8
      );
   }
}

const drawHUD_Health = (player) => {
   
   let healthRatio = player.health / player.baseHealth;

   // if Health Over 30%
   if(player.health > player.baseHealth * minHealthRatio) {

      // Normal Bar
      drawHUD_BaseBar(
         healthRatio,
         5, 486, 729, 45,
         15, 39, 30, 9
      );
   }

   // if Health Under 30%
   else {

      // Flashing Bar
      drawHUD_BaseBar(
         healthRatio,
         4, 435, 729, 45,
         15, 39, 30, 9
      );

      flashFrame++;

      if(flashFrame > flashingSpeed) {

         // Normal Bar
         drawHUD_BaseBar(
            healthRatio,
            5, 486, 729, 45,
            15, 39, 30, 9
         );
      }

      if(flashFrame > flashingSpeed *2) {
         flashFrame = 0;
      }
   }
}

const drawHUD_Energy = (player) => {
   
   let energyRatio = player.energy / player.baseEnergy;

   // Yellow Bar
   drawHUD_BaseBar(
      energyRatio,
      4, 536, 461, 45,
      82, 65, 165, 8
   );
}


// =====================================================================
// Player Bars
// =====================================================================
const drawBars_Client = (player) => {
   
   const clientPlayerBar = {
      ctx: ctxUI,
      x: viewSize.width/2 - barWidth/2,
      y: viewSize.height/2,
      width: barWidth,
      height: barHeight,
   }

   const attackBar = new GameBar(clientPlayerBar, 0, 65, player.GcD, player.speedGcD);
   const attackCoord = barCoordArray[ barCoordArray.length -1 ]; // Always get last index

   attackBar.draw(
      hudImage,
      attackCoord.x,
      attackCoord.y,
      attackCoord.width,
      attackCoord.height
   );
}

const drawBars_OtherPlayer = (player) => {
      
   const healthBar = {
      name: "health",
      maxValue: player.baseHealth,
      value: player.health,
   };

   const manaBar = {
      name: "mana",
      maxValue: player.baseMana,
      value: player.mana,
   };

   const energyBar = {
      name: "energy",
      maxValue: player.baseEnergy,
      value: player.energy,
   };

   // Bar Value Array
   const barValueArray = [
      healthBar,
      manaBar,
      energyBar,
   ];

   const otherPlayerBar = {
      ctx: ctxEnemies,
      x: player.x - viewport.x,
      y: player.y - viewport.y,
      width: barWidth,
      height: barHeight,
   }
   
   let barGap = 0;
   let barOffset = 9;
   
   for(let i = 0; i < barValueArray.length; i++) {
      
      let bar = barValueArray[i];
      if(player.isDead) bar.value = 0;
      
      const gameBar = new GameBar(otherPlayerBar, -barWidth/2, -95 +barGap, bar.maxValue, bar.value);
      let index = i;

      // Mana Bar
      if(bar.name === "mana") {
         if(player.mana >= player.healCost) index = i;
         else index = barCoordArray.length -2;
      }
      
      // Health Bar
      if(bar.name === "health") {
         if(player.health > player.baseHealth * minHealthRatio) index = i;
         else index = barCoordArray.length -1;
      }
      
      // Other Bar
      gameBar.draw(
         hudImage,
         barCoordArray[index].x,
         barCoordArray[index].y,
         barCoordArray[index].width,
         barCoordArray[index].height
      );

      barGap += barOffset;
   };
}


// =====================================================================
// Draw Player, Shadow, Name
// =====================================================================
const playerSprites = {
   height: 200,
   width: 200,
   offsetY: 5,
   radius: 45,
}

const drawShadow = (ctx, player) => {
   
   ctx.fillStyle = "rgba(30, 30, 30, 0.6)";
   ctx.beginPath();
   ctx.ellipse(
      pos(player,"x"),
      pos(player,"y") + playerSprites.radius,
      playerSprites.radius * 0.8, playerSprites.radius * 0.4, 0, 0, Math.PI * 2
   );
   ctx.fill();
   ctx.closePath();
}

const drawPlayer = (ctx, player) => {

   let animState = playerAnimState(player);

   ctx.drawImage(
      animState,
      player.frameX * playerSprites.width, player.frameY * playerSprites.height, playerSprites.width, playerSprites.height,      
      pos(player,"x") - playerSprites.width/2,
      pos(player,"y") - playerSprites.height/2 - playerSprites.offsetY,
      playerSprites.height, playerSprites.width,
   );
}

const drawName = (ctx, player) => {
   
   let offsetY = 95;
   let namePos_X = pos(player,"x") - (player.name.length * 7);
   let namePos_Y = pos(player,"y") + offsetY;
   
   ctx.fillStyle = "lime";
   ctx.font = "22px Orbitron-ExtraBold";
   ctx.fillText(player.name, namePos_X, namePos_Y);
   ctx.strokeText(player.name, namePos_X, namePos_Y);
}


// =====================================================================
// Player Animation State
// =====================================================================
const playerAnimPath = "client/images/playerAnim/";

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

   return animState;
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
// Player Fame
// =====================================================================
const playerFame = (player) => {

   const barWidth = 1000;

   const fameBarSpecs = {
      ctx: ctxUI,
      x: viewSize.width/2 - barWidth/2,
      y: 10,
      width: barWidth,
      height: 20,
   }

   const fameBar = new GameBar(fameBarSpecs, 0, 0, player.baseFame, player.fameValue);

   fameBar.draw(
      hudImage,
      50, 586, 350, 50
      // 50, 612, 350, 23
   );
}


// =====================================================================
// Player Sync (Every frame)
// =====================================================================
const playerSync = (player) => {

   // if Client
   if(viewport_HTML.id === String(player.id)) {
      
      // Camera 
      scrollCam(player);
      
      // UI
      drawHUD_Mana(player);
      drawHUD_Health(player);
      drawHUD_Energy(player);
      playerFame(player);
      
      // Player
      drawShadow(ctxPlayer, player);
      drawPlayer(ctxPlayer, player);
      drawName(ctxPlayer, player);  
      drawBars_Client(player);
   }
   
   
   // if Other Players
   else {
      drawBars_OtherPlayer(player);

      // Player
      drawShadow(ctxEnemies, player);
      drawPlayer(ctxEnemies, player);
      drawName(ctxEnemies, player);   
   }
   
   // DEBUG_Player(player);
}


// =====================================================================
// Init Player
// =====================================================================
const initPlayer = (socket) => {

   drawHUD_Frame();
   initPlayerUI(socket);
   floatingText(socket)
   deathScreen(socket);
   onKeyboardInput(socket);
   onMouseInput(socket);
}


// =====================================================================
// ==>  DEBUG MODE  <==
// =====================================================================
const DEBUG_Player = (player) => {

   DEBUG_DrawPlayer(player);
   DEBUG_DrawAttackArea(player);
   DEBUG_DrawHealthNumber(player);
}

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