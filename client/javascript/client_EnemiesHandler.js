
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

   ctx.enemies.drawImage(
      animState,
      minotaur.frameX * minotaurSprites.width, minotaur.frameY * minotaurSprites.height, minotaurSprites.width, minotaurSprites.height,      
      minotaur.x - camera.viewport.x - minotaurSprites.width/2 + minotaurSprites.offsetX,
      minotaur.y - camera.viewport.y - minotaurSprites.height/2 + minotaurSprites.offsetY,
      minotaurSprites.width * minotaurSprites.sizeRatio, minotaurSprites.height * minotaurSprites.sizeRatio
   );

   // =====================
   // --- Temporary ---
   // =====================
   const minotaurBar = {
      ctx: ctx.enemies,
      x: minotaur.x - camera.viewport.x,
      y: minotaur.y - camera.viewport.y,
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
   
   ctx.enemies.fillStyle = "rgba(30, 30, 30, 0.6)";
   ctx.enemies.beginPath();
   ctx.enemies.ellipse(
      minotaur.x - camera.viewport.x,
      minotaur.y - camera.viewport.y + minotaurSprites.radius,
      minotaurSprites.radius * 0.8, minotaurSprites.radius * 0.4, 0, 0, Math.PI * 2
   );
   ctx.enemies.fill();
   ctx.enemies.closePath();
}

const drawName = (minotaur) => {
      
   let offsetY = 87;
   const name = "Plains minotaur";
   
   ctx.enemies.textAlign = "center";
   ctx.enemies.fillStyle = "red";
   ctx.enemies.font = "20px Orbitron-ExtraBold";
   ctx.enemies.fillText(
      name,
      minotaur.x - camera.viewport.x,
      minotaur.y - camera.viewport.y -offsetY,
   );
   ctx.enemies.strokeText(
      name,
      minotaur.x - camera.viewport.x,
      minotaur.y - camera.viewport.y -offsetY,
   );
}


// =====================================================================
// Minotaur Animation State
// =====================================================================
const minotaurAnimPath = "client/images/enemiesAnim/";

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
      // DEBUG_Minotaur(minotaur);
      drawMinotaurShadow(minotaur);
      drawMinotaur(minotaur);
      drawName(minotaur);
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
   ctx.enemies.globalAlpha = 0.5;
   ctx.enemies.fillStyle = "gold";
   ctx.enemies.beginPath();
   ctx.enemies.arc(
      minotaur.spawnX -camera.viewport.x,
      minotaur.spawnY -camera.viewport.y,
      minotaur.maxChaseRange + minotaur.radius,
      0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();
   ctx.enemies.globalAlpha = 1;
}

const DEBUG_WanderRange = (minotaur) => {

   // Circle
   ctx.enemies.fillStyle = "darkviolet";
   ctx.enemies.beginPath();
   ctx.enemies.arc(
      minotaur.spawnX -camera.viewport.x,
      minotaur.spawnY -camera.viewport.y,
      minotaur.wanderRange + minotaur.radius,
      0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();
}

const DEBUG_ChasingRange = (minotaur) => {

   // Circle
   ctx.enemies.globalAlpha = 0.6;
   ctx.enemies.fillStyle = "red";
   ctx.enemies.beginPath();
   ctx.enemies.arc(
      minotaur.x -camera.viewport.x,
      minotaur.y -camera.viewport.y,
      minotaur.chasingRange,
      0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();
   ctx.enemies.globalAlpha = 1;
}

const DEBUG_DrawMinotaur = (minotaur) => {
   
   // Mob Radius
   ctx.enemies.fillStyle = "blue";
   ctx.enemies.beginPath();
   ctx.enemies.arc(minotaur.x - camera.viewport.x, minotaur.y - camera.viewport.y, minotaur.radius, 0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();

   // Health
   ctx.enemies.fillStyle = "black";
   ctx.enemies.font = "26px Orbitron-Regular";
   ctx.enemies.fillText(minotaur.health, minotaur.x -camera.viewport.x -25, minotaur.y -camera.viewport.y);

   // Center
   ctx.enemies.fillStyle = "yellow";
   ctx.enemies.beginPath();
   ctx.enemies.arc(minotaur.x - camera.viewport.x, minotaur.y - camera.viewport.y, 6, 0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();
}

const DEBUG_PathLine = (minotaur) => {

   // Point
   ctx.enemies.fillStyle = "lime";
   ctx.enemies.beginPath();
   ctx.enemies.arc(minotaur.spawnX -camera.viewport.x, minotaur.spawnY -camera.viewport.y, 4, 0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();

   // Path Line
   ctx.enemies.strokeStyle = "lime";
   ctx.enemies.beginPath();
   ctx.enemies.moveTo(minotaur.spawnX -camera.viewport.x, minotaur.spawnY -camera.viewport.y);
   ctx.enemies.lineTo(minotaur.calcX -camera.viewport.x, minotaur.calcY -camera.viewport.y);
   ctx.enemies.lineWidth = 4;
   ctx.enemies.stroke();
}

const DEBUG_ReachPoint = (minotaur) => {

   // Point
   ctx.enemies.fillStyle = "blue";
   ctx.enemies.beginPath();
   ctx.enemies.arc(minotaur.calcX -camera.viewport.x, minotaur.calcY -camera.viewport.y, 4, 0, Math.PI * 2);
   ctx.enemies.fill();
   ctx.enemies.closePath();
}