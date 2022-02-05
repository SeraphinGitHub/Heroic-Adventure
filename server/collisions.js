
"use strict"

// =====================================================================
// Collision Square to Square hitboxes
// =====================================================================
exports.square_toSquare = (first, second) => {
   if(!(first.x > second.x + second.width
      ||first.x + first.width < second.x
      ||first.y > second.y + second.height
      ||first.y + first.height < second.y)) {
         return true;
   }
}


// =====================================================================
// Collision Circle to Circle hitboxes
// =====================================================================
exports.circle_toCircle = (first, second, offsetX, offsetY, radius) => {
   let dx = second.x - (first.x + offsetX);
   let dy = second.y - (first.y + offsetY);
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = radius + second.radius;

   if(distance <= sumRadius) return true;
}