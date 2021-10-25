
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


// =====================================================================
//  Map Creation
// =====================================================================
const drawMap = (ctxMap) => {

   // Desert Floor
   for(let x = 0; x < canvasMap.width; x += cellSize) {
      for(let y = 0; y < canvasMap.height; y += cellSize) {

         ctxMap.strokeStyle = "black";
         ctxMap.strokeRect(x, y, cellSize, cellSize);
         new Tile(ctxMap, x, y, desert_6, 256, 256, cellSize).draw();
      }
   }

   ctxMap.drawImage(tree_1, 0, 0, 285, 297, 200, 400, cellSize, cellSize);
}


// =====================================================================
// Draw Tree (Temporary)
// =====================================================================
const drawTree = (ctxMap, tree) => {

   ctxMap.fillStyle = tree.color; // <== Debug Mode

   ctxMap.fillRect(
      tree.x + tree.offsetX - 50,
      tree.y + tree.offsetY - 50,
      100,
      100
   );
   ctxMap.fill();


   // ctxMap.beginPath();
   // ctxMap.arc(tree.x + tree.offsetX, tree.y + tree.offsetY, tree.radius, tree.angle, Math.PI * 2);
   // ctxMap.fill();
   // ctxMap.closePath();

   ctxMap.drawImage(tree_1, 0, 0, 285, 297, tree.x, tree.y, cellSize, cellSize);
}


// =====================================================================
// Map Init (Every frame)
// =====================================================================
const initMap = (ctxMap, tree) => {
   drawMap(ctxMap);
   // drawTree(ctxMap, tree);
}