
"use strict"

// =====================================================================
// Set Viewport
// =====================================================================
const viewport_HTML = document.querySelector(".viewport");

const viewSize = {
   height: 800,
   width: 1200,
}

viewport_HTML.style = `
   height: ${viewSize.height}px;
   width: ${viewSize.width}px;
`;

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
const ctxPlayer = ctxArray[1];
const ctxUI = ctxArray[2];


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
viewport_HTML.addEventListener("mouseover", () => insideCanvas = true);
viewport_HTML.addEventListener("mouseleave", () => insideCanvas = false);


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
// Client Sync (Every frame)
// =====================================================================
const clientSync = (socket) => {
   socket.on("newSituation", (playerData) => {
      
      ctxArray.forEach(ctx => ctx.clearRect(0, 0, viewSize.width, viewSize.height));
      playerData.forEach(player => playerSync(player));
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