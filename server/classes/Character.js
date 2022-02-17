
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

   square_toCircle(square, circle) {

      // const square = {
      //    x: sqrX,
      //    y: sqrY,
      //    height: sqrH,
      //    width: sqrW,
      // }
      
      // const circle = {
      //    x: cirX,
      //    y: cirY,
      //    radius: cirRadius,
      // }

      if(  (circle.x + circle.radius > square.x
         && circle.x - circle.radius < square.x + square.width
         || circle.x - circle.radius < square.x + square.width
         && circle.x + circle.radius > square.x)
         
         &&(circle.y + circle.radius > square.y
         && circle.y - circle.radius < square.y + square.height
         || circle.y - circle.radius < square.y + square.height
         && circle.y + circle.radius > square.y) ) {
         
         return true;
      }
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