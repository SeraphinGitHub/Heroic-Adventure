
"use strict"

// =====================================================================
// Set Viewport & Map Size
// =====================================================================
const viewSize = {
   height: 800,
   width: 1200,
}

const viewport = new Viewport(viewSize.width, viewSize.height);
const viewport_HTML = document.querySelector(".viewport");

viewport_HTML.style = `
   height: ${viewSize.height}px;
   width: ${viewSize.width}px;
`;


// =====================================================================
// Set UI Canvas
// =====================================================================
const canvasUI = document.querySelector(".canvas-UI");
const ctxUI = canvasUI.getContext("2d");

canvasUI.height = viewSize.height;
canvasUI.width = viewSize.width;

ctxUI.imageSmoothingEnabled = false;
ctxUI.webkitImageSmoothingEnabled = false;


// =====================================================================
// Set Map Canvas
// =====================================================================
const canvasMap = document.querySelector(".canvas-map");
const ctxMap = canvasMap.getContext("2d");

canvasMap.height = viewSize.height;
canvasMap.width = viewSize.width;

ctxMap.imageSmoothingEnabled = false;
ctxMap.webkitImageSmoothingEnabled = false;


// =====================================================================
// Set Game Canvas
// =====================================================================
const canvasCharsNumber = 12;
const canvasArray = [];
const ctxArray = [];

for(let i = 0; i < canvasCharsNumber; i++) {
   canvasArray.push(document.querySelector(`.canvas-characters-${ i+1 }`));
   ctxArray.push(canvasArray[i].getContext("2d"));

   canvasArray[i].height = viewSize.height;
   canvasArray[i].width = viewSize.width;

   // Disabled Anti-Aliasing
   ctxArray[i].imageSmoothingEnabled = false;
   ctxArray[i].webkitImageSmoothingEnabled = false;
}


// =====================================================================
// Inside Canvas Detection
// =====================================================================
let insideCanvas = false;
canvasUI.addEventListener("mouseover", () => insideCanvas = true);
canvasUI.addEventListener("mouseleave", () => insideCanvas = false);


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
      
      // for(let i = 0; i < canvasCharsNumber; i++) {
      //    ctxArray[i].clearRect(0, 0, canvasArray[i].width, canvasArray[i].height);
      // }

      ctxArray[0].clearRect(0, 0, canvasArray[0].width, canvasArray[0].height);
      ctxMap.clearRect(0, 0, canvasMap.width, canvasMap.height);

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