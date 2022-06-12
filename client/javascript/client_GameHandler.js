
"use strict"

// =====================================================================
// Set Viewport between 1920px - 1550px
// =====================================================================
const setViewport = () => {

   const viewport = {
      x: 0,
      y: 0,
      height: 870,
      width: 1780,
   };
   
   if(document.body.clientWidth <= 1850) {
      viewport.height = 810;
      viewport.width = 1410;

      HUD_Offset.y = -40;
      HUD_Scale.x = 1.1;
      HUD_Scale.y = 0.9;
   }

   return viewport;
}


// =====================================================================
// Set All Canvas & Contexts
// =====================================================================
const setContexts = () => {

   let ctxArray = [];
   const allCanvas = document.getElementsByTagName("canvas");
   
   for(let i = 0; i < allCanvas.length; i++) {
      let canvas = allCanvas[i];
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      ctxArray.push(canvas.getContext("2d"));
      ctxArray[i].imageSmoothingEnabled = false;
   }

   const ctx = {
      map:        ctxArray[0],
      enemies:    ctxArray[1],
      player:     ctxArray[2],
      fixedBack:  ctxArray[3],
      fixedUI:    ctxArray[4],
      UI:         ctxArray[5],
      fixedFront: ctxArray[6],
   }
   
   return ctx;
}


// =====================================================================
// Inside Viewport Detection
// =====================================================================
let insideViewport = false;

const viewportDetection = () => {

   const canvasUIFront = document.querySelector(".canvas-fixed-front");
   canvasUIFront.addEventListener("mouseenter", () => insideViewport = true);
   canvasUIFront.addEventListener("mouseleave", () => insideViewport = false);
}


// =====================================================================
// Disable right click menu
// =====================================================================
document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}


// =====================================================================
// Image Files
// =====================================================================
const imgFile = () => {
   
   const gameUI_Img = new Image();
   gameUI_Img.src = "client/images/playerUI/Game UI.png";
   
   const player_Img = new Image();
   player_Img.src = "client/images/playerAnim/playerAnim_x4.png";

   return {
      gameUI_Img: gameUI_Img,
      player_Img: player_Img,
   }
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

const viewport = setViewport();
const ctx = setContexts(viewport);
const HUD = setHUD(viewport);

viewportDetection();
HUD_DrawFrame();


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
   mapTile_Img:   initMap().mapTile_Img,
   gameUI_Img:    imgFile().gameUI_Img,
   player_Img:    imgFile().player_Img,
   mapSpecs:      initMap(),
   miniBars:      miniBars,
   barCoordArray: barCoordArray,
}

const cl_Enemy = {
   viewport:         viewport,
   ctxEnemies:       ctx.enemies,
   gameUI_Img:       imgFile().gameUI_Img,
   miniBars:         miniBars,
   barCoordArray:    barCoordArray,
}

const character = new Character();
const clientPlayer = new Player(cl_Player, {});
const clientEnemy = new Enemy(cl_Enemy, {});


// =====================================================================
// Canvas Clearing
// =====================================================================
const canvasClearing = () => {

   ctx.map.clearRect(0, 0, viewport.width, viewport.height);
   ctx.enemies.clearRect(0, 0, viewport.width, viewport.height);
   ctx.player.clearRect(0, 0, viewport.width, viewport.height);
   ctx.UI.clearRect(0, 0, viewport.width, viewport.height);
}


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

   // Draw floating text
   clientPlayer.drawFloatingText();
   clientPlayer.drawFluidBar();
   frame++;
      
   requestAnimationFrame(clientUpdate);
}