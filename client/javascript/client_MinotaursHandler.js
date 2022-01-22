
"use strict"

// =====================================================================
// Draw Minotaur
// =====================================================================
const drawMinotaur = (minotaur) => {

   // Circle
   ctxEnemies.fillStyle = "red";
   ctxEnemies.beginPath();
   ctxEnemies.arc(minotaur.x - viewport.x, minotaur.y - viewport.y, minotaur.radius, 0, Math.PI * 2);
   ctxEnemies.fill();
   ctxEnemies.closePath();

   // Health
   ctxEnemies.fillStyle = "black";
   ctxEnemies.font = "26px Orbitron-Regular";
   ctxEnemies.fillText(minotaur.health, minotaur.x -viewport.x -25, minotaur.y -viewport.y);
}


// =====================================================================
// Minotaur Sync (Every frame)
// =====================================================================
const minotaurSync = (minotaur) => {
      
   drawMinotaur(minotaur);
}