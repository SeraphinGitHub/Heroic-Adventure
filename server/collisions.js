
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
exports.circle_toCircle = (first, second) => {
   let dx = second.x - first.x;
   let dy = second.y - first.y;
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = first.radius + second.radius;

   if(distance <= sumRadius) return true;
}


// =====================================================================
// Collision Circle to Circle hitboxes with offset
// =====================================================================
exports.circle_toCircle_withOffset = (first, firstOffsetX, firstOffsetY, firstRadius , second) => {
   let dx = second.x - (first.x + firstOffsetX);
   let dy = second.y - (first.y + firstOffsetY);
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = firstRadius + second.radius;

   if(distance <= sumRadius) return true;
}


// =====================================================================
// Collision Circle to Circle Range
// =====================================================================
exports.circle_toCircle_withRange = (first, second, range) => {
   let dx = second.x - first.x;
   let dy = second.y - first.y;
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = range + second.radius;

   if(distance <= sumRadius) return true;
}