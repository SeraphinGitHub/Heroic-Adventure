
"use strict"

class Character {
   constructor() {

   }

   // Collisions
   square_toSquare(first, second) {
      if(!(first.x > second.x + second.width
         ||first.x + first.width < second.x
         ||first.y > second.y + second.height
         ||first.y + first.height < second.y)) {
            return true;
      }
   }
   
   circle_toCircle(first, second, offsetX, offsetY, radius) {
      let dx = second.x - (first.x + offsetX);
      let dy = second.y - (first.y + offsetY);
      let distance = Math.sqrt(dx * dx + dy * dy);
      let sumRadius = radius + second.radius;
   
      if(distance <= sumRadius) return true;
   }

   // Distance
   calcDistance(firstX, firstY, secondX, secondY) {
      let distX = secondX - firstX;
      let distY = secondY - firstY;
      return Math.round( Math.sqrt(distX * distX + distY * distY) );
   }

   // RnG
   RnG(baseSpec, coeff) {
      return Math.floor(baseSpec) + Math.floor(Math.random() * (baseSpec * coeff));
   }
}

module.exports = Character;