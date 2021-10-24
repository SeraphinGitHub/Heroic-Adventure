
"use strict"

// =====================================================================
// Collision for square hitbox
// =====================================================================
exports.square_toSquare_Collision = (first, second) => {
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
exports.circle_toCircle_Collision = (first, second) => {
   let dx = second.x - (first.x + first.attkOffset_X);
   let dy = second.y - (first.y + first.attkOffset_Y);
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = first.attkRadius + second.radius;

   if(distance <= sumRadius) return true;
}


// ========== ORIGINALE ==========
// exports.circle_toCircle_Collision = (first, second) => {
//    let dx = second.x - first.x;
//    let dy = second.y - first.y;
//    let distance = Math.sqrt(dx * dx + dy * dy);
//    let sumRadius = first.radius + second.radius;

//    if(distance <= sumRadius) return true;
// }