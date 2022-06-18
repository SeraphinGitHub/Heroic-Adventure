
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

      HUD: {
         scaleX: 1.2,
         scaleY: 1,
         width: 400,
         offsetY: 0,
      },

      Fame: {
         scaleX: 1.5,
         scaleY: 1,
         width: 900,
         offsetY: 0,
      },
   };
   
   if(document.body.clientWidth <= 1850) {
      viewport.height = 810;
      viewport.width = 1410;

      viewport.Fame.scaleX = 1.3;
      viewport.Fame.scaleY = 0.9;
      viewport.Fame.offsetY = 0;

      viewport.HUD.scaleX = 1.1;
      viewport.HUD.scaleY = 0.9;
      viewport.HUD.offsetY = -40;
   }

   return viewport;
}

const viewport = setViewport();

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

const ctx = setContexts();


// =====================================================================
// Canvas Clearing ==> _ClientGameHandler.ClientUpdate()
// =====================================================================
const canvasClearing = () => {

   ctx.map.clearRect(0, 0, viewport.width, viewport.height);
   ctx.enemies.clearRect(0, 0, viewport.width, viewport.height);
   ctx.player.clearRect(0, 0, viewport.width, viewport.height);
   ctx.UI.clearRect(0, 0, viewport.width, viewport.height);
}


// =====================================================================
// Inside Viewport Detection
// =====================================================================
let insideViewport = false;
const canvasUIFront = document.querySelector(".canvas-fixed-front");
canvasUIFront.addEventListener("mouseenter", () => insideViewport = true);
canvasUIFront.addEventListener("mouseleave", () => insideViewport = false);


// =====================================================================
// Disable right click menu
// =====================================================================
document.body.oncontextmenu = (event) => {
   event.preventDefault();
   event.stopPropagation();
}