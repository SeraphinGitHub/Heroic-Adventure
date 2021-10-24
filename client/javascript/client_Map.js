
"use strict"

// =====================================================================
// Files Import - Map Creation
// =====================================================================
const drawMap = () => {
   const mapFolder_Src = "client/images/map/";

   const desert_6 = new Image();
   desert_6.src = `${mapFolder_Src}land/land_6.png`;
   
   const tree_1 = new Image();
   tree_1.src = `${mapFolder_Src}trees/tree_1.png`;
   
   const cellSize = 200;

   // Desert Floor
   for(let x = 0; x < canvas.width; x += cellSize) {
      for(let y = 0; y < canvas.height; y += cellSize) {

         ctx.strokeStyle = "black";
         ctx.strokeRect(x, y, cellSize, cellSize);
         new Tile(ctx, x, y, desert_6, 256, 256, cellSize).draw();
      }
   }
   
   // Tree
   ctx.drawImage(tree_1, 0, 0, 285, 297, 200, 400, cellSize, cellSize);
}