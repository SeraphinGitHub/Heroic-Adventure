
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
let isGettingFame = false;
let isLoosingFame = false;
let fameCost = 0;
let getFameFluid = 0;
let looseFameFluid = 0;

// ==> create Globales Variables Section in GameHandler.js 


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
   
   socket.on("getFame", (player, serverfameCost) => {
      const text = {
         x: -105,
         y: 180,
         size: mainTexSize,
         color: "darkviolet",
         value: `+${serverfameCost} Fame`,
      }
      
      playerFloatingText(player, text);
      isGettingFame = true;
      fameCost = serverfameCost;
   });
   
   socket.on("looseFame", (player, serverfameCost) => {
      const text = {
         x: -105,
         y: 180,
         size: mainTexSize,
         color: "red",
         value: `-${serverfameCost} Fame`,
      }
      
      playerFloatingText(player, text);
      isLoosingFame = true;
      fameCost = serverfameCost;
      looseFameFluid = serverfameCost;
   });
}


// =====================================================================
// Player HUD
// =====================================================================
const gameUIimage = new Image();
gameUIimage.src = "client/images/playerUI/Game UI.png";

const hudScale_X = 1.2;
const hudScale_Y = 1;

// Healing bar Coord : 6, 376, 729, 45,

const minHealthRatio = 0.3; // Min Health before flash (%)
const flashingSpeed = 6;
let flashFrame = 0;

const hud = {
   x: viewport.width/2 -400/2 *hudScale_X,
   y: viewport.height -110 *hudScale_Y,
   width: 400 *hudScale_X,
   height: 100 *hudScale_Y,
}

const drawHUD_Frame = () => {
   
   // Background
   ctxFixedBack.drawImage(gameUIimage,
      5, 181, 729, 141,
      hud.x + (15 *hudScale_X), // Pos X
      hud.y + (10 *hudScale_Y), // Pos Y
      hud.width - (30 *hudScale_X), // Width
      hud.height - (20 *hudScale_Y) // Height
   );

   // HUD Sprite
   ctxFixedFront.drawImage(gameUIimage,
      5, 4, 782, 173,
      hud.x, hud.y, hud.width, hud.height
   );
}

const drawHUD_BaseBar = (ratio, sx, sy, sw, sh, offX, offY, offW, offH) => {

   ctxUI.drawImage(gameUIimage,
      sx, sy, sw *ratio, sh,
      hud.x + (offX *hudScale_X),
      hud.y + (offY *hudScale_Y),
      ( hud.width - (offW *hudScale_X) ) *ratio,
      hud.height/3 - (offH *hudScale_Y)
   );
}

const drawHUD_Mana = (player) => {
   
   let manaRatio = player.mana / player.baseMana;
   
   // Still Castable Mana
   if(player.mana >= player.healCost) {
      drawHUD_BaseBar(
         manaRatio,
         6, 528, 460, 47,
         82, 10, 165, 8
      );
   }
   
   // Low Mana
   else {
      drawHUD_BaseBar(
         manaRatio,
         5, 475, 461, 47,
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
         5, 327, 729, 45,
         15, 39, 30, 9
      );
   }

   // if Health Under 30%
   else {

      // Flashing Bar
      drawHUD_BaseBar(
         healthRatio,
         6, 424, 729, 45,
         15, 39, 30, 9
      );

      flashFrame++;

      if(flashFrame > flashingSpeed) {

         // Normal Bar
         drawHUD_BaseBar(
            healthRatio,
            5, 327, 729, 45,
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
      6, 582, 460, 46,
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
   const attackCoord = barCoordArray[3]; // Always get last index

   attackBar.draw(
      gameUIimage,
      attackCoord.x,
      attackCoord.y,
      attackCoord.width,
      attackCoord.height
   );
}

const drawBars_OtherPlayer = (player) => {

   // Bar Value Array
   const barValueArray = [
      {
         name: "health",
         maxValue: player.baseHealth,
         value: player.health,
      },

      {
         name: "mana",
         maxValue: player.baseMana,
         value: player.mana,
      },

      {
         name: "energy",
         maxValue: player.baseEnergy,
         value: player.energy,
      }
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
      
      let index;      
      
      // Health Bar
      if(bar.name === "health") {
         index = 0;
         if(player.health <= player.baseHealth * minHealthRatio) index = 3;
      }

      // Mana Bar
      if(bar.name === "mana") {
         index = 5;
         if(player.mana < player.healCost) index = 6;
      }

      // Energy Bar
      if(bar.name === "energy") index = 1;
      
      // Draw Bar
      gameBar.draw(
         gameUIimage,
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
const fameScale_X = 1.2;

const fame = {
   x: viewSize.width/2 -900/2 *fameScale_X,
   y: viewport.height -805,
   width: 900 *fameScale_X,
   height: 53,
}

// Fame - GetFame : 552, 477, 26, 48,,
// Fame - LooseFame : 552, 529, 26, 48,

const drawFame_Frame = () => {

   // Background
   ctxFixedBack.drawImage(gameUIimage,
      522, 477, 26, 48,
      fame.x + (41 *fameScale_X),
      fame.y + 19,
      fame.width - (83 *fameScale_X),
      fame.height - 27
   );

   // HUD Sprite
   ctxFixedFront.drawImage(gameUIimage,
      5, 633, 2177, 105,
      fame.x, fame.y, fame.width, fame.height
   );
}

const drawFame = (player) => {

   let fameBarWidth = (player.fameValue / player.baseFame) * (fame.width - (83 *fameScale_X));

   // Fame Bar
   ctxUI.drawImage(gameUIimage,
      522, 529, 26, 48,
      fame.x + (41 *fameScale_X),
      fame.y + 19,
      fameBarWidth,
      fame.height - 27
   );
}

const drawFameCount = (fameCount) => {

   // Fame Count   
   ctxFixedFront.fillStyle = "darkviolet";
   ctxFixedFront.font = "30px Orbitron-ExtraBold";
   ctxFixedFront.fillText(fameCount, fame.x +fame.width -10, fame.y +53);
   ctxFixedFront.strokeText(fameCount, fame.x +fame.width -10, fame.y +53);
}

const fameFluidity = (player, fameFluid, state, stateName) => {

   if(state) {

      let origin_X;
      const fluidSpeed = 15;

      let fullBarWidth = fame.width - (83 *fameScale_X);
      let miniBarWidth = fameCost / player.baseFame * fullBarWidth;
      let calcWidth = (fameFluid / fameCost) * miniBarWidth;
      
      if(calcWidth <= 0) calcWidth = 0;

      if(stateName === "get") {
         fameFluid += fluidSpeed;
         origin_X = player.fameValue / player.baseFame * fullBarWidth;

         if(fameFluid >= fameCost) {
            fameFluid = 0;
            state = false;
         }
      }

      if(stateName === "loose") {
         fameFluid -= fluidSpeed;
         origin_X = player.fameValue / player.baseFame * fullBarWidth;

         if(fameFluid <= -fameCost) {
            fameFluid = 0;
            state = false;
         }
      }

      ctxUI.drawImage(
         gameUIimage,
         522, 529, 26, 48,
         origin_X,
         fame.y +19 +50,
         calcWidth,
         fame.height - 27
      );
   }
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
      drawFame(player);
      // fameFluidity(player, getFameFluid, isGettingFame, "get");
      // fameFluidity(player, looseFameFluid, isLoosingFame, "loose");
      
      // Player
      drawShadow(ctxPlayer, player);
      drawPlayer(ctxPlayer, player);
      drawName(ctxPlayer, player);  
      drawBars_Client(player);

      if(isGettingFame) {
   
         let fullBarWidth = fame.width - (83 *fameScale_X);
         let miniBarWidth = fameCost / player.baseFame * fullBarWidth;
         let fameBarWidth = player.fameValue / player.baseFame * fullBarWidth;
         let origin_X = fame.x + (41 *fameScale_X) + fameBarWidth;

         let calcWidth = (getFameFluid / fameCost) * miniBarWidth;
         if(calcWidth <= 0) calcWidth = 0;

         // Value Bar
         ctxUI.drawImage(
            gameUIimage,
            // 522, 529, 26, 48,
            552, 477, 26, 48,
            origin_X,
            fame.y +19 +20,
            calcWidth,
            fame.height - 27
         );

         const ratio = 3;
         getFameFluid += ratio;
         
         if(getFameFluid >= fameCost) {
            getFameFluid = fameCost;
            // getFameFluid = 0;
            // isGettingFame = false;
         }
      }


      if(isLoosingFame) {

         let fullBarWidth = fame.width - (83 *fameScale_X);
         let origin_X = player.fameValue / player.baseFame * fullBarWidth;
         let miniBarWidth = fameCost / player.baseFame * fullBarWidth;

         let calcWidth = (looseFameFluid / fameCost) * miniBarWidth;
         if(calcWidth <= 0) calcWidth = 0;

         // Value Bar
         ctxUI.drawImage(
            gameUIimage,
            522, 529, 26, 48,
            origin_X,
            fame.y +19 +30,
            calcWidth,
            fame.height - 27
         );

         const ratio = 15;
         looseFameFluid -= ratio;
         
         if(looseFameFluid <= -fameCost) {
            looseFameFluid = 0;
            isLoosingFame = false;
         }
      }
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
   drawFame_Frame();
   initPlayerUI(socket);
   floatingText(socket)
   deathScreen(socket);
   onKeyboardInput(socket);
   onMouseInput(socket);

   socket.on("fameCount+1", (fameCount) => {

      ctxFixedBack.clearRect(0, 0, viewSize.width, viewSize.height);
      ctxFixedFront.clearRect(0, 0, viewSize.width, viewSize.height);

      drawHUD_Frame();
      drawFame_Frame();
      drawFameCount(fameCount);
   });
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