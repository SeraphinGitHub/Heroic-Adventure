
"use strict"

// =====================================================================
// Scrips import
// =====================================================================
const Enemy = require("../classes/Enemy.js");
const collision = require("../collisions.js");


// =====================================================================
// Set Minotaurs
// =====================================================================
const set_Minotaurs = (mobList) => {

   const minotaursSpawns = [
      {x: 700, y: 600},
      {x: 1500, y: 600},
      {x: 1000, y: 1200},
   ];

   const minotaursSpecs = {

      health: 150,
      radius: 55,
      wanderRange: 120,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      GcD: 60,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      attackDelay: 0.5,
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

   set_Minotaurs(mobList);   
}


// =====================================================================
// Enemies Movements
// =====================================================================
const enemiesMovements = (enemy) => {

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
// Enemies Global Count Down
// =====================================================================
const enemiesGcD = (enemy) => {
   
   // Regen GcD
   if(enemy.speedGcD < enemy.GcD) {
      enemy.speedGcD +=process.env.SYNC_COEFF* 1;
      if(enemy.isAttacking) enemy.isAttacking = false;
   }
   
   // GcD Up
   if(enemy.speedGcD >= enemy.GcD) enemiesAttack(enemy);
}


// =====================================================================
// Enemies Attack
// =====================================================================
const enemiesAttack = (enemy) => {
   
   // Enemy Attack
   if(enemy.isAttacking && !enemy.attack_isAnimable) {
      
      enemy.frameX = 0;
      enemy.speedGcD = 0;
      enemy.isAttacking = false;
      enemy.attack_isAnimable = true;
      
      setTimeout(() => enemy.attack_isAnimable = false, enemyiesAnimTimeOut(enemy));
      damagingPlayers(enemy, playerList);
   }
}


// =====================================================================
// Damaging Players
// =====================================================================
const looseFameCost_PvE = 200;

const damagingPlayers = (enemy) => {

   for(let i in playerList) {
      let player = playerList[i];

      if(!player.isDead
      && collision.circle_toCircle(enemy, player, 0, 0, enemy.radius)) {

         setTimeout(() => {     
            player.calcDamage = enemy.damageRnG();
            player.health -= player.calcDamage;

            let socket = socketList[player.id];

            // Player's Death
            if(player.health <= 0) {
               
               player.death(looseFameCost_PvE);

               socket.emit("playerScore", {
                  kills: player.kills,
                  died: player.died,
                  fame: player.fame,
                  fameCount: player.fameCount,
               });
               
               socket.emit("looseFame", player, looseFameCost_PvE);
            }
            
            const playerData = {
               x: player.x,
               y: player.y,
               calcDamage: player.calcDamage,
            };
            
            socket.emit("getDamage", playerData);
         }, enemyiesAnimTimeOut(enemy) * enemy.attackDelay);
      }
   }
}


// =====================================================================
// Enemies Sate Machine
// =====================================================================
const enemiesSateMachine = (enemy) => {
   
   for(let i in playerList) {
      let player = playerList[i];

      // Chasing
      if(collision.circle_toCircle(enemy, player, 0, 0, enemy.chasingRange)) {
         
         enemy.isWandering = false;
         enemy.isChasing = true;

         if(!player.isDead) enemy.moveToPosition(player.x, player.y, enemy.runSpeed);
         else enemy.isWandering = true;

         // Attacking
         if(collision.circle_toCircle(enemy, player, 0, 0, enemy.radius)) {

            enemy.isChasing = false;
            enemy.isAttacking = true;
            enemy.runSpeed = 0;
         }

         // Back to Chasing
         else {
            enemy.isChasing = true;
            enemy.isAttacking = false;
            enemy.runSpeed = enemy.baseRunSpeed;
         }
      }

      // Back to Spawn
      else enemy.backToSpawn();
   }
   
   // Wandering
   enemy.wandering();
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

   attack: {
      index: 2,
      spritesNumber: 11,
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

   attack: {
      index: 2,
      spritesNumber: 11,
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

   attack: {
      index: 2,
      spritesNumber: 11,
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

         // Attack State
         if(enemy.attack_isAnimable) {
            enemy.animation(frame, animType.attack.index, animType.attack.spritesNumber);
            return enemy.state = "attack";
         }

         // Idle State
         if(enemy.x === enemy.calcX && enemy.y === enemy.calcY || enemy.runSpeed === 0) {
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

const enemyiesAnimTimeOut = (enemy) => {
   let timeOut;

   enemiesAnimType.forEach(animType => {
      if(!enemy.isDead) timeOut = Math.round(process.env.FRAME_RATE * process.env.SYNC_COEFF * animType.attack.index * animType.attack.spritesNumber / 4);
   });

   return timeOut;
}


// =====================================================================
// Enemies Update (Every frame)
// =====================================================================
let socketList;
let playerList;
let mobList;

exports.enemiesUpdate = (frame, G_SocketList, G_PlayerList, G_mobList) => {
   
   socketList = G_SocketList;
   playerList = G_PlayerList;
   mobList = G_mobList;

   let enemiesData = [];
   
   for(let i in mobList) {
      let enemy = mobList[i];
      
      if(!enemy.isDead) {

         enemiesGcD(enemy);
         enemiesMovements(enemy);
         enemiesSateMachine(enemy);
      }
      
      handleEnemiesState(frame, enemy);
      enemiesData.push(enemy);
   }
   
   return enemiesData;
}