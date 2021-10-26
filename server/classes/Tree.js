
"use strict"

class Tree {
   constructor(x, y) {
      
      // Hitbox
      this.x = x;
      this.y = y;
      this.offsetX = 120;
      this.offsetY = 180;
      this.radius = 40;
      this.angle = 0;
      this.color = "red";
   }
}

module.exports = Tree;