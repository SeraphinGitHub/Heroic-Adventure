
"use strict"

// =====================================================================
// Set Viewport
// =====================================================================
const viewSize = {
   height: 870, // ==> Check to match with viewport size in CSS
   width: 1780,
};
const viewport = new Viewport(0, 0, viewSize.width, viewSize.height);


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
const canvasUIFront = document.querySelector(".canvas-fixed-front");

canvasUIFront.addEventListener("mouseenter", () => insideCanvas = true);
canvasUIFront.addEventListener("mouseleave", () => insideCanvas = false);

canvasUIFront.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}


// =====================================================================
// Set All Canvas & Contexts
// =====================================================================
const set_Canvas = () => {

   const allCanvas = document.getElementsByTagName("canvas");
   let ctxArray = [];
   
   for(let i = 0; i < allCanvas.length; i++) {
      let canvasIndexed = allCanvas[i];
      ctxArray.push(canvasIndexed.getContext("2d"));
   
      canvasIndexed.height = viewSize.height;
      canvasIndexed.width = viewSize.width;
      ctxArray[i].imageSmoothingEnabled = false;
   }

   return ctxArray;
}

const ctx = {

   map:        set_Canvas()[0],
   enemies:    set_Canvas()[1],
   player:     set_Canvas()[2],
   fixedBack:  set_Canvas()[3],
   fixedUI:    set_Canvas()[4],
   UI:         set_Canvas()[5],
   fixedFront: set_Canvas()[6],
}


// =====================================================================
// Canvas Clearing
// =====================================================================
const ctxFixedBack_index = 3;
const ctxFixedUI_index = 4;
const ctxFixedFront_index = 6;

const ctxArray = set_Canvas();

const canvasClearing = () => {
   
   for(let i = 0; i < ctxArray.length; i++) {
      let ctxIndexed = ctxArray[i];
      
      if(i === ctxFixedBack_index
      || i === ctxFixedUI_index
      || i === ctxFixedFront_index) continue;

      ctxIndexed.clearRect(0, 0, viewSize.width, viewSize.height);
   }
}


// =====================================================================
// Mini Bars Coordinates
// =====================================================================
const miniBarSpecs = {
   
   barWidth: 115,
   barHeight: 8,
}

// Coordinates PNG file
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


// =====================================================================
// PNG Image Files
// =====================================================================
const set_ImageFiles = () => {
   
   const gameUI_Img = new Image();
   gameUI_Img.src = "client/images/playerUI/Game UI.png";
   
   const player_Img = new Image();
   player_Img.src = "client/images/playerAnim/playerAnim_x4.png";

   return [
      gameUI_Img,
      player_Img,
   ];
}

const imgPNG = {
   gameUI_Img:    set_ImageFiles()[0],
   player_Img:    set_ImageFiles()[1],
}


// =====================================================================
// Init Classes
// =====================================================================
const cl_PlayerObj = {

   // Viewport
   viewSize:      viewSize,
   viewport:      viewport,

   // Canvas
   ctxMap:        ctx.map,
   ctxEnemies:    ctx.enemies,
   ctxOtherPlay:  ctx.otherPlay,
   ctxPlayer:     ctx.player,
   ctxFixedBack:  ctx.fixedBack,
   ctxFixedUI:    ctx.fixedUI,
   ctxUI:         ctx.UI,
   ctxFixedFront: ctx.fixedFront,

   // PNG Files
   mapTile_Img:   mapSpecs.mapTile_Img,
   gameUI_Img:    imgPNG.gameUI_Img,
   player_Img:    imgPNG.player_Img,

   // Map
   mapSpecs:      mapSpecs,

   // Game UI ==> Mini Bars
   barWidth:      miniBarSpecs.barWidth,
   barHeight:     miniBarSpecs.barHeight,
   barCoordArray: barCoordArray,
}

const cl_EnemyObj = {

   // Viewport
   viewport:      viewport,

   // Canvas
   ctxEnemies:       ctx.enemies,

   // PNG Files
   gameUI_Img:    imgPNG.gameUI_Img,

   // Game UI ==> Mini Bars
   barWidth:         miniBarSpecs.barWidth,
   barHeight:        miniBarSpecs.barHeight,
   barCoordArray:    barCoordArray,
}

const character = new Character();
const clientPlayer = new Player(cl_PlayerObj, {});
const clientEnemy = new Enemy(cl_EnemyObj, {});


// =====================================================================
// Client Sync with Server
// =====================================================================
let clientID;

let initPlayerList = {};
let initMobList = {};

let updatePlayerList = {};
let updateMobList = {};


// =====================================================================
// Client Update (Every frame)
// =====================================================================
let frame = 0;

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
            initPlayer.render_ClientPlayer(updatePlayer, frame);
         }
         else initPlayer.render_OtherPlayer(updatePlayer, frame);
      }
   }
   
   // Mobs Update
   for(let i in updateMobList) {
      
      let updateEnemy = updateMobList[i];
      let initEnemy = initMobList[updateEnemy.id];
      initEnemy.render_Enemy(updateEnemy, frame);
   };

   // Draw floating text
   clientPlayer.drawFloatingText();
   clientPlayer.drawFluidBar();
   frame++;

   if(showFPS) frameRate++;

   window.requestAnimationFrame(clientUpdate);
}


// =====================================================================
// Toggle Frame Rate
// =====================================================================
let showFPS = false;
let frameRate = 0;

if(showFPS) {
   setInterval(() => {
      console.log(frameRate);
      frameRate = 0;
   }, 1000);
}