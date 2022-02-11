
"use strict"

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