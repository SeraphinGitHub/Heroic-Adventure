
"use strict"

class GameBar {
   constructor(ctx, x, y, offsetX, offsetY, width, height, color) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.width = width;
      this.height = height;
      this.color = color;
   }

   update() {

   }

   draw() {
      this.ctx.fillStyle = this.color;
      this.ctx.rect(this.x + this.offsetX, this.y + this.offsetY, this.width, this.height);
      this.ctx.fill();
   }
}