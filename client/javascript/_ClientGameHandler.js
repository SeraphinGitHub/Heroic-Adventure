
"use strict"

// =====================================================================
// Image Files
// =====================================================================
const imgFiles = () => {
   
   const gameUI = new Image();
   gameUI.src = "client/images/playerUI/Game UI.png";
   
   const player = new Image();
   player.src = "client/images/playerAnim/playerAnim_x4.png";

   const mapTile = new Image();
   mapTile.src = "client/images/map/Map Tiles.png";

   return {
      gameUI: gameUI,
      player: player,
      mapTile: mapTile,
   }
}

const ImgFiles = imgFiles();


// =====================================================================
// Init Classes
// =====================================================================
const miniBars = {
   height: 8,
   width: 115,
}

const barCoordArray = [
   
   // Green
   {
      x: 474,
      y: 477,
      width: 16,
      height: 25,
   },

   // Yellow
   {
      x: 498,
      y: 477,
      width: 16,
      height: 25,
   },
   
   // Orange
   {
      x: 498,
      y: 509,
      width: 16,
      height: 25,
   },
   
   // Red
   {
      x: 498,
      y: 541,
      width: 16,
      height: 25,
   },

   // blueGreen
   {
      x: 474,
      y: 509,
      width: 16,
      height: 25,
   },

   // Blue
   {
      x: 474,
      y: 541,
      width: 16,
      height: 25,
   },
   
   // Dark Blue
   {
      x: 474,
      y: 574,
      width: 16,
      height: 25,
   },
   
   // Purple
   {
      x: 498,
      y: 574,
      width: 16,
      height: 25,
   },
];

const cl_Player = {
   viewport:      viewport,
   ctx:           ctx,
   imgFiles:      ImgFiles,
   mapSpecs:      MapSpecs,
   miniBars:      miniBars,
   barCoordArray: barCoordArray,
}

const cl_Enemy = {
   viewport:         viewport,
   ctxEnemies:       ctx.enemies,
   imgFiles:         ImgFiles,
   miniBars:         miniBars,
   barCoordArray:    barCoordArray,
}


// =====================================================================
// Client Sync with Server
// =====================================================================
let clientID;
let clientLoaded = false;
let initPlayerList = {};
let initMobList = {};
let updatePlayerList = {};
let updateMobList = {};


// =====================================================================
// Client Update (Every frame)
// =====================================================================
let frame = 0;
let debugPlayer = false;
let debugMobs = false;

const clientUpdate = () => {
   
   // Clear contexts
   canvasClearing();

   
   // ***************************************************************
   // ***************************************************************

   // ctx.player.fillStyle = "blue";
   // ctx.player.fillRect(
   //    810 -viewport.x,
   //    810 -viewport.y +90,
   //    180 *2,
   //    90 *2
   // );

   // ***************************************************************
   // ***************************************************************


   // Players Update
   for(let i in updatePlayerList) {
      
      let updatePlayer = updatePlayerList[i];
      let initPlayer = initPlayerList[updatePlayer.id];
      
      if(initPlayer) {
         if(clientID === updatePlayer.id) {
            
            initPlayer.isClient = true;
            initPlayer.render_ClientPlayer(updatePlayer, frame, debugPlayer);

            HUD_DrawMana(initPlayer.initPack, updatePlayer);
            HUD_DrawHealth(initPlayer.initPack, updatePlayer);
            HUD_DrawEnergy(initPlayer.initPack, updatePlayer);
         }
         else initPlayer.render_OtherPlayer(updatePlayer, frame);
      }
   }
   
   // Mobs Update
   for(let i in updateMobList) {
      
      let updateEnemy = updateMobList[i];
      let initEnemy = initMobList[updateEnemy.id];
      initEnemy.render_Enemy(updateEnemy, frame, debugMobs);
   };
   
   drawFloatingText();
   drawFluidBar();
   
   frame++;
   requestAnimationFrame(clientUpdate);
}