
"use strict"

class Character {

   // Remove Array Index
   removeIndex(array, item) {

      let index = array.indexOf(item);
      array.splice(index, 1);
      index--;
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

   circle_toSquare(cirX, cirY, cirRadius, sqrX, sqrY, sqrW, sqrH) {

      let distX = Math.abs(cirX - (sqrX + sqrW /2));
      let distY = Math.abs(cirY - (sqrY + sqrH /2));

      if(distX > cirRadius + sqrW /2) { return false };
      if(distY > cirRadius + sqrH /2) { return false };
      if(distX <= sqrW) { return false };
      if(distY <= sqrH) { return false };

      distX -= sqrW;
      distY -= sqrH;

      return (distX *distX + distY *distY <= cirRadius * cirRadius);
   }
   
   circle_toCircle(first, second, offsetX, offsetY, radius) {
      
      let distX = second.x - (first.x + offsetX);
      let distY = second.y - (first.y + offsetY);
      let distance = Math.sqrt(distX * distX + distY * distY);
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

   // Animation
   animTimeOut(index, spritesNumber) {
      // client frameRate * index * (spritesNumber -1)
      return Math.floor(1000/65 * index * (spritesNumber -1));
   }
}

module.exports = Character;