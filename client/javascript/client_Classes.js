"use strict"

// =====================================================================
// Floating Text
// =====================================================================
class FloatingText {
   constructor(ctx, x, y, offsetX, offsetY, size, color, value) {

      // Position
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      
      // Specs
      this.size = size;
      this.color = color;
      this.value = value;
      this.opacity = 1;
      this.displayDuration = 150; // More high ==> More show long time
   }
   
   drawText() {
      this.y -= 0.8;
      this.displayDuration--;
      if(this.opacity > 0.008) this.opacity -= 0.008;

      this.ctx.globalAlpha = this.opacity;
      this.ctx.fillStyle = this.color;
      this.ctx.font = `${this.size}px Orbitron-ExtraBold`;
      this.ctx.fillText(this.value, this.x + this.offsetX, this.y + this.offsetY);
      this.ctx.globalAlpha = 1;
   }
}


// =====================================================================
// Game Bar
// =====================================================================
class GameBar {

   // const barObj = {
   //    ctx: ctxUI,
   //    x: viewSize.width/2 - barWidth/2,
   //    y: viewSize.height/2,
   //    width: barWidth,
   //    height: barHeight,
   // }

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


// =====================================================================
// Tile
// =====================================================================
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


// =====================================================================
// Viewport
// =====================================================================
class Viewport {
   constructor(x, y, width, height) {
      
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
   }

   scrollTo(x, y) {
      this.x = x - this.width/2;
      this.y = y - this.height/2;
   }
}