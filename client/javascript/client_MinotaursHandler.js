
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

   contexts.ctxEnemies.drawImage(
      animState,
      minotaur.frameX * minotaurSprites.width, minotaur.frameY * minotaurSprites.height, minotaurSprites.width, minotaurSprites.height,      
      minotaur.x - viewportSpecs.viewport.x - minotaurSprites.width/2 + minotaurSprites.offsetX,
      minotaur.y - viewportSpecs.viewport.y - minotaurSprites.height/2 + minotaurSprites.offsetY,
      minotaurSprites.width * minotaurSprites.sizeRatio, minotaurSprites.height * minotaurSprites.sizeRatio
   );

   // =====================
   // --- Temporary ---
   // =====================
   const minotaurBar = {
      ctx: contexts.ctxEnemies,
      x: minotaur.x - viewportSpecs.viewport.x,
      y: minotaur.y - viewportSpecs.viewport.y,
      width: miniBarSpecs.barWidth,
      height: miniBarSpecs.barHeight,
   }
   
   const gameBar = new GameBar(minotaurBar, -miniBarSpecs.barWidth/2, -80, minotaur.baseHealth, minotaur.health);

   let index = 0;
   if(minotaur.health <= minotaur.baseHealth * colorBar.yellow) index = 1;
   if(minotaur.health <= minotaur.baseHealth * colorBar.orange) index = 2;
   if(minotaur.health <= minotaur.baseHealth * colorBar.red) index = 3;

   gameBar.draw(
      gameUI_Img,
      barCoordArray[index].x,
      barCoordArray[index].y,
      barCoordArray[index].width,
      barCoordArray[index].height
   );
}

const drawMinotaurShadow = (minotaur) => {
   
   contexts.ctxEnemies.fillStyle = "rgba(30, 30, 30, 0.6)";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.ellipse(
      minotaur.x - viewportSpecs.viewport.x,
      minotaur.y - viewportSpecs.viewport.y + minotaurSprites.radius,
      minotaurSprites.radius * 0.8, minotaurSprites.radius * 0.4, 0, 0, Math.PI * 2
   );
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();
}


// =====================================================================
// Minotaur Animation State
// =====================================================================
const minotaurAnimPath = "client/images/enemiesAnim/minotaurs/";

const minotaurAnimSrc = {
   idle: minotaurAnimPath + "idle_2x.png",
   walk: minotaurAnimPath + "walk_2x.png",
   attack: minotaurAnimPath + "attack_2x.png",
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

      case "attack": animState = minotaurAnimArray[2];
      break;

      case "died": animState = minotaurAnimArray[3];
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
      DEBUG_Minotaur(minotaur);
      drawMinotaurShadow(minotaur);
      drawMinotaur(minotaur);
   }
}


// =====================================================================
// ==>  DEBUG MODE  <==
// =====================================================================
const DEBUG_Minotaur = (minotaur) => {

   if(!minotaur.isDead) {
      DEBUG_MaxChaseRange(minotaur);
      DEBUG_WanderRange(minotaur);
      DEBUG_ChasingRange(minotaur);
      DEBUG_DrawMinotaur(minotaur);
      DEBUG_PathLine(minotaur);
      DEBUG_ReachPoint(minotaur);
   }
}

const DEBUG_MaxChaseRange = (minotaur) => {

   // Circle
   contexts.ctxEnemies.globalAlpha = 0.5;
   contexts.ctxEnemies.fillStyle = "gold";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(
      minotaur.spawnX -viewportSpecs.viewport.x,
      minotaur.spawnY -viewportSpecs.viewport.y,
      minotaur.maxChaseRange + minotaur.radius,
      0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();
   contexts.ctxEnemies.globalAlpha = 1;
}

const DEBUG_WanderRange = (minotaur) => {

   // Circle
   contexts.ctxEnemies.fillStyle = "darkviolet";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(
      minotaur.spawnX -viewportSpecs.viewport.x,
      minotaur.spawnY -viewportSpecs.viewport.y,
      minotaur.wanderRange + minotaur.radius,
      0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();
}

const DEBUG_ChasingRange = (minotaur) => {

   // Circle
   contexts.ctxEnemies.globalAlpha = 0.6;
   contexts.ctxEnemies.fillStyle = "red";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(minotaur.x -viewportSpecs.viewport.x, minotaur.y -viewportSpecs.viewport.y, minotaur.chasingRange, 0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();
   contexts.ctxEnemies.globalAlpha = 1;
}

const DEBUG_DrawMinotaur = (minotaur) => {
   
   // Mob Radius
   contexts.ctxEnemies.fillStyle = "blue";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(minotaur.x - viewportSpecs.viewport.x, minotaur.y - viewportSpecs.viewport.y, minotaur.radius, 0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();

   // Health
   contexts.ctxEnemies.fillStyle = "black";
   contexts.ctxEnemies.font = "26px Orbitron-Regular";
   contexts.ctxEnemies.fillText(minotaur.health, minotaur.x -viewportSpecs.viewport.x -25, minotaur.y -viewportSpecs.viewport.y);

   // Center
   contexts.ctxEnemies.fillStyle = "yellow";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(minotaur.x - viewportSpecs.viewport.x, minotaur.y - viewportSpecs.viewport.y, 6, 0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();
}

const DEBUG_PathLine = (minotaur) => {

   // Point
   contexts.ctxEnemies.fillStyle = "lime";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(minotaur.spawnX -viewportSpecs.viewport.x, minotaur.spawnY -viewportSpecs.viewport.y, 4, 0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();

   // Path Line
   contexts.ctxEnemies.strokeStyle = "lime";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.moveTo(minotaur.spawnX -viewportSpecs.viewport.x, minotaur.spawnY -viewportSpecs.viewport.y);
   contexts.ctxEnemies.lineTo(minotaur.calcX -viewportSpecs.viewport.x, minotaur.calcY -viewportSpecs.viewport.y);
   contexts.ctxEnemies.lineWidth = 4;
   contexts.ctxEnemies.stroke();
}

const DEBUG_ReachPoint = (minotaur) => {

   // Point
   contexts.ctxEnemies.fillStyle = "blue";
   contexts.ctxEnemies.beginPath();
   contexts.ctxEnemies.arc(minotaur.calcX -viewportSpecs.viewport.x, minotaur.calcY -viewportSpecs.viewport.y, 4, 0, Math.PI * 2);
   contexts.ctxEnemies.fill();
   contexts.ctxEnemies.closePath();
}