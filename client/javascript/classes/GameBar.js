
"use strict"

// =====================================================================
// Game Bar
// =====================================================================
class GameBar {

   constructor(barObj, offsetX, offsetY, maxValue, value) {
      this.ctx = barObj.ctx;
      
      // Position
      this.x = barObj.x;
      this.y = barObj.y;
      this.offsetX = offsetX;
      this.offsetY = offsetY;

      // Specs
      this.width = barObj.width;
      this.height = barObj.height;
      this.maxValue = maxValue;
      this.value = value;

      // Frame
      this.borderSize = 2;
      this.barWidth = ((this.value / this.maxValue) * this.width) - this.borderSize;
      this.borderColor = "black";
      this.bgdColor = "rgb(110, 110, 110)";
   }

   barFrame(color, barWidth, brdSize) {
      this.ctx.fillStyle = color;

      this.ctx.fillRect(
         this.x + this.offsetX + brdSize/2,
         this.y + this.offsetY + brdSize/2,
         barWidth,
         this.height - brdSize
      );
   }

   draw(img, x, y, width, height) {

      // Borders
      this.barFrame(this.borderColor, this.width, 0);

      // Background
      this.barFrame(this.bgdColor, this.width -this.borderSize, this.borderSize);

      if(this.barWidth <= 0) this.barWidth = 0;

      // Value Bar
      this.ctx.drawImage(
         img,
         x, y, width, height,
         this.x + this.offsetX + this.borderSize/2,
         this.y + this.offsetY + this.borderSize/2,
         this.barWidth,
         this.height - this.borderSize
      );
   }
}