
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

const viewportSpecs = set_Viewport();


// =====================================================================
// Set All Canvas & Contexts
// =====================================================================
const set_Canvas = () => {

   const allCanvas = document.getElementsByTagName("canvas");
   let ctxArray = [];
   
   for(let i = 0; i < allCanvas.length; i++) {
      let canvasIndexed = allCanvas[i];
      ctxArray.push(canvasIndexed.getContext("2d"));
   
      canvasIndexed.height = viewportSpecs.viewSize.height;
      canvasIndexed.width = viewportSpecs.viewSize.width;
      ctxArray[i].imageSmoothingEnabled = false;
   }

   return ctxArray;
}

const contexts = {

   ctxMap:        set_Canvas()[0],
   ctxEnemies:    set_Canvas()[1],
   ctxPlayer:     set_Canvas()[2],
   ctxFixedBack:  set_Canvas()[3],
   ctxUI:         set_Canvas()[4],
   ctxFixedFront: set_Canvas()[5],
}


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
viewportSpecs.viewport_HTML.addEventListener("mouseover", () => insideCanvas = true);
viewportSpecs.viewport_HTML.addEventListener("mouseleave", () => insideCanvas = false);


// =====================================================================
// Draw Floating Text
// =====================================================================
let floatTextArray = [];

const drawFloatingText = () => {

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
const miniBarSpecs = {
   
   barWidth: 110,
   barHeight: 8,
}

const barsCoordinates = () => {
   // Coordinates PNG file

   // Green
   const greenCoord = {
      x: 474,
      y: 477,
      width: 16,
      height: 25,
   };

   // Yellow
   const yellowCoord = {
      x: 498,
      y: 477,
      width: 16,
      height: 25,
   };
   
   // Orange
   const orangeCoord = {
      x: 498,
      y: 509,
      width: 16,
      height: 25,
   };
   
   // Red
   const redCoord = {
      x: 498,
      y: 541,
      width: 16,
      height: 25,
   };

   // blueGreen
   const blueGreenCoord = {
      x: 474,
      y: 509,
      width: 16,
      height: 25,
   };

   // Blue
   const blueCoord = {
      x: 474,
      y: 541,
      width: 16,
      height: 25,
   };
   
   // Dark Blue
   const darkBlueCoord = {
      x: 474,
      y: 574,
      width: 16,
      height: 25,
   };
   
   // Purple
   const purpleCoord = {
      x: 498,
      y: 574,
      width: 16,
      height: 25,
   };
   
   return [
      greenCoord,    // 0
      yellowCoord,   // 1
      orangeCoord,   // 2
      redCoord,      // 3
      blueGreenCoord,// 4
      blueCoord,     // 5
      darkBlueCoord, // 6
      purpleCoord,   // 7
   ];
}

const barCoordArray = barsCoordinates();


// =====================================================================
// PNG Image Files
// =====================================================================
const mapTile_Img = new Image();
mapTile_Img.src = "client/images/map/map_tile_3_lands.png";

const gameUI_Img = new Image();
gameUI_Img.src = "client/images/playerUI/Game_UI.png";

const character_Img = new Image();
character_Img.src = "client/images/playerAnimation/playerAnim_4x.png";


// =====================================================================
// Init Client Class
// =====================================================================
const clientSpecs = {

   // Viewport
   viewport:      viewportSpecs.viewport,
   viewport_HTML: viewportSpecs.viewport_HTML,
   viewSize:      viewportSpecs.viewSize,
   centerVp_X:    viewportSpecs.centerVp_X,
   centerVp_Y:    viewportSpecs.centerVp_Y,

   // Canvas
   ctxUI:         contexts.ctxUI,
   ctxMap:        contexts.ctxMap,
   ctxPlayer:     contexts.ctxPlayer,
   ctxEnemies:    contexts.ctxEnemies,
   ctxFixedBack:  contexts.ctxFixedBack,
   ctxFixedFront: contexts.ctxFixedFront,

   // PNG Files
   mapTile_Img:   mapTile_Img,
   gameUI_Img:    gameUI_Img,
   character_Img: character_Img,

   // Map
   mapSpecs: mapSpecs,

   // Game UI ==> Mini Bars
   barWidth:      miniBarSpecs.barWidth,
   barHeight:     miniBarSpecs.barHeight,
   barCoordArray: barCoordArray,
}

const client = new ClientPlayer(clientSpecs);


// =====================================================================
// Client Sync (Every frame)
// =====================================================================
let frame = 0;

const clientSync = (socket) => {

   const ctxArray = set_Canvas();

   let ctxFixedBack_index = ctxArray.length -3;
   let ctxFixedFront_index = ctxArray.length -1;

   socket.on("newSituation", (
         playerData,
         minotaurData
      ) => {

      // Canvas Clearing
      for(let i = 0; i < ctxArray.length; i++) {
         let ctxIndexed = ctxArray[i];

         if(i !== ctxFixedBack_index
         && i !== ctxFixedFront_index) {
            ctxIndexed.clearRect(0, 0, viewportSpecs.viewSize.width, viewportSpecs.viewSize.height);
         }
      }

      playerData.forEach(serverPlayer => client.playerSync(serverPlayer, frame));
      minotaurData.forEach(minotaur => minotaurSync(minotaur, frame));

      drawFloatingText();
      frame++;
      
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