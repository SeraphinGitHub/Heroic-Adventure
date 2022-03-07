
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

   square_toCircle(stateStr, square, circle) {

      const circ = {
         left:   circle.x -circle.radius,
         right:  circle.x +circle.radius,
         top:    circle.y -circle.radius,
         bottom: circle.y +circle.radius,
      }

      const sqr = {
         left:   square.x,
         right:  square.x +square.width,
         top:    square.y,
         bottom: square.y +square.height,
      }
      
      if(stateStr === "normal") return this.sqr_Circ_Normal(circ, sqr);
      if(stateStr === "special") return this.sqr_Circ_Special(circ, sqr);
   }

   sqr_Circ_Normal(circ, sqr) {

      if(circ.right  > sqr.left
      && circ.left   < sqr.right
      && circ.bottom > sqr.top
      && circ.top    < sqr.bottom) {
      
         return true;
      }
   }

   sqr_Circ_Special(circ, sqr) {

      const collide = {
         left: false,
         right: false,
         top: false,
         bottom: false,
      }
      
      // Horizontal Check
      if(circ.bottom > sqr.top && circ.top < sqr.bottom) {

         if(circ.right > sqr.left && circ.left < sqr.left) collide.left = true;
         if(circ.left < sqr.right && circ.right > sqr.right) collide.right = true;
      }

      if(circ.bottom === sqr.top || circ.top === sqr.bottom) {
         collide.left = false;
         collide.right = false;
      }

      
      // Vertical Check
      if(circ.right > sqr.left && circ.left < sqr.right) {

         if(circ.bottom > sqr.top && circ.top < sqr.top) collide.top = true;
         if(circ.top < sqr.bottom && circ.bottom > sqr.bottom) collide.bottom = true;
      }

      if(circ.left === sqr.right || circ.right === sqr.left) {
         collide.top = false;
         collide.bottom = false;
      }

      return collide;
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