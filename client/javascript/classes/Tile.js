
"use strict"

class Tile {
   constructor(ctx, x, y, img, imgWidth, imgHeight, cellSize) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.img = img;
      this.imgWidth = imgWidth;
      this.imgHeight = imgHeight;
      this.cellSize = cellSize;
   }

   draw() {
      this.ctx.drawImage(this.img, 0, 0, this.imgWidth, this.imgHeight, this.x, this.y, this.cellSize, this.cellSize);
   }
}