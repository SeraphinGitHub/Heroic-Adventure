
"use strict"

// =====================================================================
// Scrips import
// =====================================================================
const Enemy = require("../classes/Enemy.js");
const collision = require("../collisions.js");


// =====================================================================
// Init Minotaurs
// =====================================================================
const initMinotaurs = (mobList) => {

   const minotaursSpawns = [
      {x: 800, y: 600},
      {x: 1400, y: 600},
      {x: 1000, y: 1100},
   ];

   const minotaursSpecs = {

      health: 150,
      radius: 55,
      wanderRange: 120,
      wanderBreakTime: 2 *1000,
      chasingRange: 300,
      GcD: 50,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,
   }

   cycleEnemiesPos(mobList, minotaursSpawns, minotaursSpecs);
}


// =====================================================================
// Cycle Enemies Positions
// =====================================================================
const cycleEnemiesPos = (mobList, enemySpawnObj, enemySpecs) => {

   enemySpawnObj.forEach(position => {
      const enemy = new Enemy(position.x, position.y, enemySpecs);
      mobList.push(enemy);
   });
}


// =====================================================================
// Init Enemies
// =====================================================================
exports.initEnemies = (mobList) => {

   initMinotaurs(mobList);   
}


// =====================================================================
// Enemies Movements
// =====================================================================
const enemiesMovements = (enemy) => {

   enemy.wandering();
   
   // ===== 4 Directions Sprites Sheets =====
      // // Cross Move
      // if(enemy.y > enemy.calcY) enemy.frameY = 0; // Up
      // if(enemy.y < enemy.calcY) enemy.frameY = 1; // Down
      // if(enemy.x > enemy.calcX) enemy.frameY = 2; // Left
      // if(enemy.x < enemy.calcX) enemy.frameY = 3; // Right

      // // Diag Move
      // if(enemy.y > enemy.calcY && enemy.x > enemy.calcX
      // || enemy.y > enemy.calcY && enemy.x < enemy.calcX) enemy.frameY = 0; // Top Left / Top Right
      // if(enemy.y < enemy.calcY && enemy.x > enemy.calcX
      // || enemy.y < enemy.calcY && enemy.x < enemy.calcX) enemy.frameY = 1; // Down Left / Down Right
   // ===== 4 Directions Sprites Sheets =====


   // ===== 2 Directions Sprites Sheets =====
      // Cross Move
      if(enemy.y > enemy.calcY || enemy.x > enemy.calcX) enemy.frameY = 0; // Left
      if(enemy.y < enemy.calcY || enemy.x < enemy.calcX) enemy.frameY = 1; // Right

      // Diag Move
      if(enemy.y > enemy.calcY && enemy.x > enemy.calcX
      || enemy.y < enemy.calcY && enemy.x > enemy.calcX) enemy.frameY = 0; // Top / Down Left
      if(enemy.y > enemy.calcY && enemy.x < enemy.calcX
      || enemy.y < enemy.calcY && enemy.x < enemy.calcX) enemy.frameY = 1; // Top / Down Right
   // ===== 2 Directions Sprites Sheets =====
}


// =====================================================================
// Enemies Animation Types
// =====================================================================
// Minotaurs
const minotaursAnim = {
   idle: {
      index: 3,
      spritesNumber: 11,
   },

   walk: {
      index: 2,
      spritesNumber: 17,
   },

   died: {
      index: 2,
      spritesNumber: 14,
   },
}

// Golems
const golemsAnim = {
   idle: {
      index: 3,
      spritesNumber: 11,
   },

   walk: {
      index: 2,
      spritesNumber: 17,
   },

   died: {
      index: 2,
      spritesNumber: 14,
   },
}

// Orcs
const orcsAnim = {
   idle: {
      index: 3,
      spritesNumber: 11,
   },

   walk: {
      index: 2,
      spritesNumber: 17,
   },

   died: {
      index: 2,
      spritesNumber: 14,
   },
}


// =====================================================================
// Handle Enemies State
// =====================================================================
const enemiesAnimType = [

   minotaursAnim,
   // golemsAnim,
   // orcsAnim,
];

const handleEnemiesState = (frame, enemy) => {
   
   enemiesAnimType.forEach(animType => {
      if(!enemy.isDead) {

         // Idle State
         if(enemy.x === enemy.calcX && enemy.y === enemy.calcY) {
            enemy.animation(frame, animType.idle.index, animType.idle.spritesNumber);
            return enemy.state = "idle";
         }
      
         // Walk State
         else {
            enemy.animation(frame, animType.walk.index, animType.walk.spritesNumber);
            return enemy.state = "walk";
         }
      }

      else {
         enemy.animation(frame, animType.died.index, animType.died.spritesNumber);
         enemy.state = "died";
      }
   });
}


// =====================================================================
// Enemies Update (Every frame)
// =====================================================================
exports.enemiesUpdate = (frame, mobList) => {
   let enemiesData = [];
   
   for(let i in mobList) {
      let enemy = mobList[i];
      
      if(!enemy.isDead) {
         enemiesMovements(enemy);
      }
      
      handleEnemiesState(frame, enemy);
      enemiesData.push(enemy);
   }
   
   return enemiesData;
}