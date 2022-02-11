
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
      this.ctx.strokeText(this.value, this.x + this.offsetX, this.y + this.offsetY);
      this.ctx.globalAlpha = 1;
   }
}