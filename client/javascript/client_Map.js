
"use strict"

// =====================================================================
// Files Import
// =====================================================================
const mapFolder_Src = "client/images/map/";
const cellSize = 200;

const desert_6 = new Image();
desert_6.src = `${mapFolder_Src}land/land_6.png`;

const tree_1 = new Image();
tree_1.src = `${mapFolder_Src}trees/tree_1.png`;

const greenery_3 = new Image();
greenery_3.src = `${mapFolder_Src}greenery_3.png`;


// =====================================================================
//  Init Grid
// =====================================================================
let cellArray = [];

const initGrid = () => {

   // Desert Floor
   for(let x = 0; x < canvasMap.width; x += cellSize) {
      for(let y = 0; y < canvasMap.height; y += cellSize) {

         cellArray.push(new Tile(ctxMap, x, y, desert_6, 256, 256, cellSize));
      }
   }
}


// =====================================================================
//  Draw Map
// =====================================================================
const drawMap = () => {
   
   cellArray.forEach(cell => {
      ctxMap.strokeStyle = "black";
      ctxMap.strokeRect(cell.x, cell.y, cellSize, cellSize);
      cell.draw();
   });

   // Decor (Temporary)
   ctxMap.drawImage(tree_1, 0, 0, 285, 297, 200, 400, cellSize, cellSize);
   ctxMap.drawImage(tree_1, 0, 0, 285, 297, 800, 200, cellSize, cellSize);
   ctxMap.drawImage(greenery_3, 0, 0, 87, 162, 250, 25, 87, 162);
}


// =====================================================================
// Map Init
// =====================================================================
const initMap = () => {

   initGrid();
   drawMap();
}