
"use strict"

// =====================================================================
// Floating Messages
// =====================================================================
class FloatingMessage {
   constructor(ctx, x, y, offsetX, offsetY, size, color, value) {
      this.ctx = ctx;
      this.x = x;
      this.y = y;
      this.offsetX = offsetX;
      this.offsetY = offsetY;
      this.size = size;
      this.color = color;
      this.value = value;
      this.opacity = 1;
   }

   update() {
      this.y -= 0.8;
      if(this.opacity > 0.01 ) this.opacity -= 0.01;
   }

   draw() {
      this.ctx.globalAlpha = this.opacity;
      this.ctx.fillStyle = this.color;
      this.ctx.font = `${this.size}px Orbitron-ExtraBold`;
      this.ctx.fillText(this.value, this.x + this.offsetX, this.y + this.offsetY);
      this.ctx.globalAlpha = 1;
   }
}