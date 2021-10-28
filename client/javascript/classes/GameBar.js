
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
      this.borderSize = 2;
      this.width = ((this.value / this.maxValue) * this.maxWidth) - this.borderSize;
      this.bordersColor = "black";
      this.backgroundColor = "rgb(110, 110, 110)";
   }

   baseBar(color, barWidth, brd_Size) {
      this.ctx.fillStyle = color;

      this.ctx.fillRect(
         this.x + this.offsetX + brd_Size/2,
         this.y + this.offsetY + brd_Size/2,
         barWidth,
         this.height - brd_Size
      );
   }

   draw() {
      if(this.width <= 0) this.width = 0;

      // Borders
      this.baseBar(this.bordersColor, this.maxWidth, 0);

      // Background
      this.baseBar(this.backgroundColor, this.maxWidth - this.borderSize, this.borderSize);

      // Value Bar
      this.baseBar(this.fillColor, this.width, this.borderSize);
   }
}