
"use strict"

// =====================================================================
// Files Import - Map Creation
// =====================================================================
const drawMap = () => {

   const mapFolder_Src = "client/images/map/";

   // const cellSize = 200;
   // const cellGap = 3;
   // const grid = [];

   // ctx.strokeStyle = "black";
   // ctx.strokeRect(0, 0, cellSize, cellSize);

   const desert_6 = new Image();
   const tree_1 = new Image();

   desert_6.src = `${mapFolder_Src}land/land_6.png`;
   tree_1.src = `${mapFolder_Src}trees/tree_1.png`;

   // Exemple:
   // ctx.drawImage(img, 0, 0, imgWidth, imgHeight, posX_OnCanvas, posY_OnCanvas, scaleX, scaleY);
   
   // ===========================================================================
   // Temporary
   // ===========================================================================
   const cellSize = 200;

   // Row 1
   ctx.drawImage(desert_6, 0, 0, 256, 256, 0, 0, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 200, 0, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 400, 0, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 600, 0, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 800, 0, cellSize, cellSize);

   // Row 2
   ctx.drawImage(desert_6, 0, 0, 256, 256, 0, 200, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 200, 200, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 400, 200, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 600, 200, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 800, 200, cellSize, cellSize);

   // Row 3
   ctx.drawImage(desert_6, 0, 0, 256, 256, 0, 400, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 200, 400, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 400, 400, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 600, 400, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 800, 400, cellSize, cellSize);

   // Row 4
   ctx.drawImage(desert_6, 0, 0, 256, 256, 0, 600, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 200, 600, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 400, 600, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 600, 600, cellSize, cellSize);
   ctx.drawImage(desert_6, 0, 0, 256, 256, 800, 600, cellSize, cellSize);

   ctx.drawImage(tree_1, 0, 0, 285, 297, 200, 400, cellSize, cellSize);
   ctx.drawImage(tree_1, 0, 0, 285, 297, 600, 200, cellSize, cellSize);

   // ===========================================================================
   // Temporary
   // ===========================================================================
}

