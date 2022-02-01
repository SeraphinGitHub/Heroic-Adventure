
"use strict"

// =====================================================================
// Set Viewport
// =====================================================================
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


// =====================================================================
// Set All Canvas & Contexts
// =====================================================================
const allCanvas = document.getElementsByTagName("canvas");
let ctxArray = [];

for(let i = 0; i < allCanvas.length; i++) {
   let canvasIndexed = allCanvas[i];
   ctxArray.push(canvasIndexed.getContext("2d"));

   canvasIndexed.height = viewSize.height;
   canvasIndexed.width = viewSize.width;
   ctxArray[i].imageSmoothingEnabled = false;
}

const ctxMap = ctxArray[0];
const ctxEnemies = ctxArray[1];
const ctxPlayer = ctxArray[2];
const ctxFixedBack = ctxArray[3];
const ctxUI = ctxArray[4];
const ctxFixedFront = ctxArray[5];


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
viewport_HTML.addEventListener("mouseover", () => insideCanvas = true);
viewport_HTML.addEventListener("mouseleave", () => insideCanvas = false);


// =====================================================================
// Map Settings
// =====================================================================
const mapTiles = new Image();
mapTiles.src = "client/images/map/map_tile_3_lands.png";

const cellSize = 180;
const mapSpriteSize = 256;
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
// Floating Text
// =====================================================================
let floatTextArray = [];

const handleFloatingText = () => {

   floatTextArray.forEach(text => {
      text.drawText();

      if(text.displayDuration <= 0) {
         let textIndex = floatTextArray.indexOf(text);
         floatTextArray.splice(textIndex, 1);
         textIndex--;
      }
   });
}


// =====================================================================
// Mini Bars Coordinates
// =====================================================================
const barWidth = 110;
const barHeight = 8;

const barsCoordinates = () => {
   // Coordinates PNG file

   // Health
   const healthCoord = {
      x: 498,
      y: 560,
      width: 49,
      height: 25,
   };

   // Mana
   const manaCoord = {
      x: 563,
      y: 561,
      width: 49,
      height: 25,
   };
   
   // Low Mana
   const lowManaCoord = {
      x: 627,
      y: 562,
      width: 50,
      height: 25,
   };

   // Energy
   const energyCoord = {
      x: 498,
      y: 591,
      width: 49,
      height: 25,
   };
   
   // Purple Bar
   const purpleCoord = {
      x: 563,
      y: 591,
      width: 49,
      height: 25,
   };
   
   // GcD
   const attackCoord = {
      x: 627,
      y: 591,
      width: 50,
      height: 25,
   };
   
   return [
      healthCoord,
      manaCoord,
      energyCoord,
      purpleCoord,

      lowManaCoord,
      attackCoord,
   ];
}

const barCoordArray = barsCoordinates();


// =====================================================================
// Client Sync (Every frame)
// =====================================================================
const clientSync = (socket) => {

   let ctxFixedBack_index = ctxArray.length -3;
   let ctxFixedFront_index = ctxArray.length -1;

   socket.on("newSituation", (playerData, minotaurData) => {

      // Canvas Clearing
      for(let i = 0; i < ctxArray.length; i++) {
         let ctxIndexed = ctxArray[i];

         if(i !== ctxFixedBack_index
         && i !== ctxFixedFront_index) {
            ctxIndexed.clearRect(0, 0, viewSize.width, viewSize.height);
         }
      }

      playerData.forEach(player => playerSync(player));
      minotaurData.forEach(minotaur => minotaurSync(minotaur));

      handleFloatingText();

      if(showFPS) frameRate++;
   });
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