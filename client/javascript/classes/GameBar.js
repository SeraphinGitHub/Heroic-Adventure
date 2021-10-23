
"use strict"

class GameBar {
   constructor(ctx, x, y, offsetX, offsetY, maxWidth, height, fillColor, maxValue, value) {
      this.ctx = ctx;
      
      // Position
      this.x = x;
      this.y = y;
      this.offsetX = offsetX;
      this.offsetY = offsetY;

      // Specs
      this.maxWidth = maxWidth;
      this.height = height;
      this.fillColor = fillColor;
      this.maxValue = maxValue;
      this.value = value;

      // Custom
      this.borderSize = 4;
      this.width = (this.value / this.maxValue) * this.maxWidth;
      this.bordersColor = "black";
      this.backgroundColor = "gray";
   }

   baseFrame(color, barWidth, brd_Size) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
         this.x + this.offsetX + brd_Size/2,
         this.y + this.offsetY + brd_Size/2,
         barWidth - brd_Size,
         this.height - brd_Size
      );
   }

   draw() {
      if(this.width <= 0) this.width = this.borderSize;
      this.baseFrame(this.bordersColor, this.maxWidth, 0);                  // Borders
      this.baseFrame(this.backgroundColor, this.maxWidth, this.borderSize); // Background
      this.baseFrame(this.fillColor, this.width, this.borderSize);          // Life Bar
   }
}