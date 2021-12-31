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