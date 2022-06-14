
"use strict"

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

const character = new Character();
const clientPlayer = new Player(cl_Player, {});
const clientEnemy = new Enemy(cl_Enemy, {});


// =====================================================================
// Client Update (Every frame)
// =====================================================================
let frame = 0;
let debugPlayer = false;
let debugMobs = false;

const clientUpdate = () => {

   // Clear contexts
   canvasClearing();

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

   // Draw floating text
   clientPlayer.drawFloatingText(); // ==> Classe ClientCharacter.js
   clientPlayer.drawFluidBar();
   frame++;
      
   requestAnimationFrame(clientUpdate);
}