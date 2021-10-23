
"use strict"

// =====================================================================
// Collision for square hitbox
// =====================================================================
exports.squareCollision = (first, second) => {
   if(!(first.x > second.x + second.width
      ||first.x + first.width < second.x
      ||first.y > second.y + second.height
      ||first.y + first.height < second.y)) {
         return true;
   }
}


// =====================================================================
// Collision for circle hitbox
// =====================================================================
exports.circleCollision = (first, second) => {
   let dx = second.x - first.x;
   let dy = second.y - first.y;
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = first.radius + second.radius;

   if(distance <= sumRadius) return true;
}