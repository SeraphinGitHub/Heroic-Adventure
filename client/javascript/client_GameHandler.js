
"use strict"

// window.dispatchEvent(new KeyboardEvent("keydown", {
//    "key": "F11"
// }));


// =====================================================================
// Set Viewport
// =====================================================================
const set_Viewport = () => {

   const viewport_HTML = document.querySelector(".viewport");
   
   const viewSize = { // ==> Check to match with viewport size in CSS
      height: 800,
      width: 1200,
   }
   
   const viewport = new Viewport(0, 0, viewSize.width, viewSize.height);
   const centerVp_X = viewSize.width/2 - viewport.width/2;
   const centerVp_Y = viewSize.height/2 - viewport.height/2;
   
   // const viewport = new Viewport(0, 0, 900, 500);
   // const centerVp_X = viewSize.width/2 - 900/2;
   // const centerVp_Y = viewSize.height/2 - 500/2;

   return {
      viewport_HTML: viewport_HTML,
      viewSize: viewSize,
      viewport: viewport,
      centerVp_X: centerVp_X,
      centerVp_Y: centerVp_Y
   };
}

const camera = set_Viewport();


// =====================================================================
// Set All Canvas & Contexts
// =====================================================================
const set_Canvas = () => {

   const allCanvas = document.getElementsByTagName("canvas");
   let ctxArray = [];
   
   for(let i = 0; i < allCanvas.length; i++) {
      let canvasIndexed = allCanvas[i];
      ctxArray.push(canvasIndexed.getContext("2d"));
   
      canvasIndexed.height = camera.viewSize.height;
      canvasIndexed.width = camera.viewSize.width;
      ctxArray[i].imageSmoothingEnabled = false;
   }

   return ctxArray;
}

const ctx = {

   map:        set_Canvas()[0],
   enemies:    set_Canvas()[1],
   otherPlay:  set_Canvas()[2],
   player:     set_Canvas()[3],
   fixedBack:  set_Canvas()[4],
   UI:         set_Canvas()[5],
   fixedFront: set_Canvas()[6],
}


// =====================================================================
// Canvas Clearing
// =====================================================================
const ctxArray = set_Canvas();
let ctxFixedBack_index = ctxArray.length -3;
let ctxFixedFront_index = ctxArray.length -1;

const canvasClearing = () => {
   
   for(let i = 0; i < ctxArray.length; i++) {
      let ctxIndexed = ctxArray[i];
      
      if(i === ctxFixedBack_index || i === ctxFixedFront_index) continue;
      ctxIndexed.clearRect(0, 0, camera.viewSize.width, camera.viewSize.height);
   }
}


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
camera.viewport_HTML.addEventListener("mouseenter", () => insideCanvas = true);
camera.viewport_HTML.addEventListener("mouseleave", () => insideCanvas = false);


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
const mapTile_Img = new Image();
mapTile_Img.src = "client/images/map/map_tile_3_lands.png";

const gameUI_Img = new Image();
gameUI_Img.src = "client/images/playerUI/Game UI.png";

const player_Img = new Image();
player_Img.src = "client/images/playerAnim/playerAnim_x4.png";


// =====================================================================
// Init Classes
// =====================================================================
const cl_PlayerObj = {

   // Viewport
   viewport:      camera.viewport,
   viewport_HTML: camera.viewport_HTML,
   viewSize:      camera.viewSize,
   centerVp_X:    camera.centerVp_X,
   centerVp_Y:    camera.centerVp_Y,

   // Canvas
   ctxMap:        ctx.map,
   ctxEnemies:    ctx.enemies,
   ctxOtherPlay:  ctx.otherPlay,
   ctxPlayer:     ctx.player,
   ctxFixedBack:  ctx.fixedBack,
   ctxUI:         ctx.UI,
   ctxFixedFront: ctx.fixedFront,

   // PNG Files
   mapTile_Img:   mapTile_Img,
   gameUI_Img:    gameUI_Img,
   player_Img:    player_Img,

   // Map
   mapSpecs:      mapSpecs,

   // Game UI ==> Mini Bars
   barWidth:      miniBarSpecs.barWidth,
   barHeight:     miniBarSpecs.barHeight,
   barCoordArray: barCoordArray,
}

const cl_EnemyObj = {

   // Viewport
   viewport:       camera.viewport,

   // Canvas
   ctxEnemies:       ctx.enemies,

   // PNG Files
   gameUI_Img:    gameUI_Img,

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
let initPlayerList = [];
let initMobList = [];
let playerUpdateList = [];
let mobUpdateList = [];


// =====================================================================
// Client Update (Every frame)
// =====================================================================
let frame = 0;

const clientUpdate = () => {

   // Clear contexts
   canvasClearing();

   // Server Sync ==> Players
   for(let i = 0; i < playerUpdateList.length; i++) {

      let initPlayer = initPlayerList[i];
      let serverPlayer = playerUpdateList[i];

      if(initPlayer) {
         if(initPlayer.viewport_HTML.id === String(serverPlayer.id)) {
            initPlayer.render_ClientPlayer(serverPlayer, frame);
         }
         else initPlayer.render_OtherPlayer(serverPlayer, frame);
      }
   };

   // Server Sync ==> Mobs
   for(let i = 0; i < mobUpdateList.length; i++) {

      let initEnemy = initMobList[i];
      let serverEnemy = mobUpdateList[i];
      initEnemy.render_Enemy(serverEnemy, frame);
   };

   // Draw floating text
   clientPlayer.drawFloatingText();
   frame++;

   if(showFPS) frameRate++;

   window.requestAnimationFrame(clientUpdate);
}


// =====================================================================
// Toggle Frame Rate
// =====================================================================
let showFPS = false;
let frameRate = 0;

setInterval(() => {
   if(showFPS) {
      console.log(frameRate);
      frameRate = 0;
   }
}, 1000);