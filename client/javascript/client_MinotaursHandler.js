
"use strict"

// =====================================================================
// Draw Minotaur
// =====================================================================
const minotaurSprites = {
   height: 200,
   width: 294,
   sizeRatio: 0.7,
   offsetX: 45,
   offsetY: 25,
   radius: 50,
}

const drawMinotaur = (minotaur) => {

   let animState = minotaurAnimState(minotaur);
   
   const colorBar = {
      
      yellow: 0.7,   // 70%
      orange: 0.5,   // 50%
      red: 0.3,      // 30%
   }

   ctxEnemies.drawImage(
      animState,
      minotaur.frameX * minotaurSprites.width, minotaur.frameY * minotaurSprites.height, minotaurSprites.width, minotaurSprites.height,      
      minotaur.x - viewport.x - minotaurSprites.width/2 + minotaurSprites.offsetX,
      minotaur.y - viewport.y - minotaurSprites.height/2 + minotaurSprites.offsetY,
      minotaurSprites.width * minotaurSprites.sizeRatio, minotaurSprites.height * minotaurSprites.sizeRatio
   );

   // =====================
   // --- Temporary ---
   // =====================
   const minotaurBar = {
      ctx: ctxEnemies,
      x: minotaur.x - viewport.x,
      y: minotaur.y - viewport.y,
      width: barWidth,
      height: barHeight,
   }
   
   const gameBar = new GameBar(minotaurBar, -barWidth/2, -80, minotaur.baseHealth, minotaur.health);

   let index = 0;
   if(minotaur.health <= minotaur.baseHealth * colorBar.yellow) index = 1;
   if(minotaur.health <= minotaur.baseHealth * colorBar.orange) index = 2;
   if(minotaur.health <= minotaur.baseHealth * colorBar.red) index = 3;

   gameBar.draw(
      gameUIimage,
      barCoordArray[index].x,
      barCoordArray[index].y,
      barCoordArray[index].width,
      barCoordArray[index].height
   );
}

const drawMinotaurShadow = (minotaur) => {
   
   ctxEnemies.fillStyle = "rgba(30, 30, 30, 0.6)";
   ctxEnemies.beginPath();
   ctxEnemies.ellipse(
      minotaur.x - viewport.x,
      minotaur.y - viewport.y + minotaurSprites.radius,
      minotaurSprites.radius * 0.8, minotaurSprites.radius * 0.4, 0, 0, Math.PI * 2
   );
   ctxEnemies.fill();
   ctxEnemies.closePath();
}


// =====================================================================
// Minotaur Animation State
// =====================================================================
const minotaurAnimPath = "client/images/enemiesAnim/minotaurs/";

const minotaurAnimSrc = {
   idle: minotaurAnimPath + "idle_2x.png",
   walk: minotaurAnimPath + "walk_2x.png",
   died: minotaurAnimPath + "died_2x.png",
}

let minotaurAnimArray = [];

for(let state in minotaurAnimSrc) {
   const animation = new Image();
   animation.src = minotaurAnimSrc[state];
   minotaurAnimArray.push(animation);
}

const minotaurAnimState = (minotaur) => {
   
   let animState;

   switch(minotaur.state) {
      case "walk": animState = minotaurAnimArray[1];
      break;

      case "died": animState = minotaurAnimArray[2];
      break;

      default: animState = minotaurAnimArray[0];
      break;
   }

   return animState;
}


// =====================================================================
// Minotaur Sync (Every frame)
// =====================================================================
const minotaurSync = (minotaur) => {
   
   if(!minotaur.isHidden) {
      // DEBUG_Minotaur(minotaur);
      drawMinotaurShadow(minotaur);
      drawMinotaur(minotaur);
   }
}


// =====================================================================
// ==>  DEBUG MODE  <==
// =====================================================================
const DEBUG_Minotaur = (minotaur) => {

   if(!minotaur.isDead) {
      DEBUG_WanderRange(minotaur);
      DEBUG_DrawMinotaur(minotaur);
      DEBUG_PathLine(minotaur);
      DEBUG_ReachPoint(minotaur);
   }
}

const DEBUG_WanderRange = (minotaur) => {

   // Circle
   ctxEnemies.fillStyle = "darkviolet";
   ctxEnemies.beginPath();
   ctxEnemies.arc(minotaur.spawnX -viewport.x, minotaur.spawnY -viewport.y, minotaur.wanderRange+minotaur.radius, 0, Math.PI * 2);
   ctxEnemies.fill();
   ctxEnemies.closePath();
}

const DEBUG_DrawMinotaur = (minotaur) => {
   
   // Mob Radius
   ctxEnemies.fillStyle = "red";
   ctxEnemies.beginPath();
   ctxEnemies.arc(minotaur.x - viewport.x, minotaur.y - viewport.y, minotaur.radius, 0, Math.PI * 2);
   ctxEnemies.fill();
   ctxEnemies.closePath();

   // Health
   ctxEnemies.fillStyle = "black";
   ctxEnemies.font = "26px Orbitron-Regular";
   ctxEnemies.fillText(minotaur.health, minotaur.x -viewport.x -25, minotaur.y -viewport.y);

   // Center
   ctxEnemies.fillStyle = "yellow";
   ctxEnemies.beginPath();
   ctxEnemies.arc(minotaur.x - viewport.x, minotaur.y - viewport.y, 6, 0, Math.PI * 2);
   ctxEnemies.fill();
   ctxEnemies.closePath();
}

const DEBUG_PathLine = (minotaur) => {

   // Point
   ctxEnemies.fillStyle = "lime";
   ctxEnemies.beginPath();
   ctxEnemies.arc(minotaur.spawnX -viewport.x, minotaur.spawnY -viewport.y, 4, 0, Math.PI * 2);
   ctxEnemies.fill();
   ctxEnemies.closePath();

   // Path Line
   ctxEnemies.strokeStyle = "lime";
   ctxEnemies.beginPath();
   ctxEnemies.moveTo(minotaur.spawnX -viewport.x, minotaur.spawnY -viewport.y);
   ctxEnemies.lineTo(minotaur.calcX -viewport.x, minotaur.calcY -viewport.y);
   ctxEnemies.lineWidth = 4;
   ctxEnemies.stroke();
}

const DEBUG_ReachPoint = (minotaur) => {

   // Point
   ctxEnemies.fillStyle = "blue";
   ctxEnemies.beginPath();
   ctxEnemies.arc(minotaur.calcX -viewport.x, minotaur.calcY -viewport.y, 4, 0, Math.PI * 2);
   ctxEnemies.fill();
   ctxEnemies.closePath();
}