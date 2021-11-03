
"use strict"

// =====================================================================
// Scrips import
// =====================================================================
const Player = require("./classes/Player.js");
const Tree = require("./classes/Tree.js");
const collision = require("./collisions.js");


// =====================================================================
// Global Variables
// =====================================================================
let playerList = {};
// let treeList = {};


// =====================================================================
// Player connection
// =====================================================================
exports.onConnect = (socket) => {
   const player = new Player(socket.id);
   playerList[socket.id] = player;

   // Init Player Stats
   socket.emit("playerStats", {
      playerName: player.name,
      health: player.baseHealth,
      mana: player.baseMana,
      regenMana: player.baseRegenMana,
      energy: player.baseEnergy,
      regenEnergy: player.baseRegenEnergy,
      GcD: player.baseGcD,
   });

   // Init Player Score
   socket.emit("playerScore", {
      kills: player.kills,
      died: player.died,
   });

   // Movements
   socket.on("up", (state) => player.up = state);
   socket.on("down", (state) => player.down = state);
   socket.on("left", (state) => player.left = state);
   socket.on("right", (state) => player.right = state);

   // Spells cast
   socket.on("heal", (state) => player.cast_Heal = state);
   
   // States
   socket.on("run", (state) => player.isRunning = state);
   socket.on("attack", (state) => player.isAttacking = state);
   socket.on("casting", (state) => player.isCasting = state);
}


// =====================================================================
// Player disconnection
// =====================================================================
exports.onDisconnect = (socket) => {
   delete playerList[socket.id];
}


// =====================================================================
// Player Global Count Down   (Attack & Spell Cast)
// =====================================================================
const playerGcD = (player, socketList) => {
   if(player.mana < player.baseMana) player.mana += player.regenMana; // Regen Mana
   
   if(player.speedGcD < player.GcD) {
      player.speedGcD += process.env.SYNC_COEFF* 1 ;
      if(player.isAttacking) player.isAttacking = false;
   }

   if(player.speedGcD >= player.GcD) {
      // player.attackAnim = false;
      

      // Player Attack
      if(player.isAttacking) {
         
         player.speedGcD = 0;
         player.attackAnim = true;
         player.isAttacking = false;
         
         damagingEnemy(player, socketList);
         // damagingEnemy(player, mobList); // <== When Mob class gonna be created
      }

      // Player Spell Cast
      if(player.isCasting) {
         
         player.isCasting = false;
         playerHealing(player);
      }
   }

   
   if(player.attackAnim) {
      aze++;
      
      if(aze >= 15) {
         aze = 0;
         player.attackAnim = false;
      }
   }
}

let aze = 0;

// =====================================================================
// Player Movements
// =====================================================================
const playerMovements = (player) => {
      
   let moveSpeed = player.walkSpeed;
   if(player.isRunning && player.isRunnable) moveSpeed = player.runSpeed;

   // Map Border Reached ==> Temporary (Await Scrolling Cam)
   if(player.up && player.y < 65
   || player.down && player.y > 740
   || player.left && player.x < 50
   || player.right && player.x > 1150) {
      moveSpeed = 0;
   }
   
   crossMove(player, moveSpeed);
   diagMove(player, moveSpeed);
}

const crossMove = (player, moveSpeed) => {

   // Up
   if(player.up) {
      player.frameY = 0;
      player.y -= moveSpeed;
      player.attkOffset_X = 0;
      player.attkOffset_Y = -47;
   }
   
   // Down
   if(player.down) {
      player.frameY = 1;
      player.y += moveSpeed;
      player.attkOffset_X = 0;
      player.attkOffset_Y = 57;
   }
   
   // Left
   if(player.left) {
      player.frameY = 2;
      player.x -= moveSpeed;
      player.attkOffset_X = -35;
      player.attkOffset_Y = 15;
   }
   
   // Right
   if(player.right) {      
      player.frameY = 3;
      player.x += moveSpeed;
      player.attkOffset_X = 18;
      player.attkOffset_Y = 10;
   }
}

const diagMove = (player, moveSpeed) => {
   const topOffset = 30;
   const bottomOffset = 37;

   // Up & Left
   if(player.up && player.left) {
      player.frameY = 0;
      player.attkOffset_X = -topOffset;
      player.attkOffset_Y = -topOffset; 
   }

   // Up & Right
   if(player.up && player.right) {
      player.frameY = 0;
      player.attkOffset_X = topOffset;
      player.attkOffset_Y = -topOffset;
   }

   // Down & Left
   if(player.down && player.left) {
      player.frameY = 1;
      player.attkOffset_X = -bottomOffset;
      player.attkOffset_Y = bottomOffset;
   }

   // Down & Right
   if(player.down && player.right) {
      player.frameY = 1;
      player.attkOffset_X = bottomOffset;
      player.attkOffset_Y = bottomOffset;
   }

   
   // =============== Diag Speed ===============
   if(player.up && player.left
   ||player.up && player.right
   ||player.down && player.left
   ||player.down && player.right) {
      moveSpeed = Math.sqrt(moveSpeed);
   }
}


// =====================================================================
// Player Running
// =====================================================================
const playerRunning = (player) => {
   if(player.energy < player.baseEnergy) player.energy += player.regenEnergy;

   if(player.isRunning && player.isRunnable) {
      
      player.energy -= player.energyCost;
      if(player.energy <= 0) player.energy = 0;
      if(player.energy < player.energyCost) player.isRunnable = false;
   }

   if(!player.isRunning) player.isRunnable = true;
}


// =====================================================================
// Player Healing
// =====================================================================
const playerHealing = (player) => {

   if(player.cast_Heal
   && player.mana >= player.healCost
   && player.health < player.baseHealth) {

      player.speedGcD = 0;
      player.isHealing = true;
      player.cast_Heal = false;

      player.calcHealing = player.healRnG();
      player.health += player.calcHealing;
      player.mana -= player.healCost;

      setTimeout(() => player.isHealing = false, 0)
      if(player.health > player.baseHealth) player.health = player.baseHealth;
   }
}


// =====================================================================
// Damaging Enemy
// =====================================================================
const damagingEnemy = (player, socketList) => {

   for(let i in playerList) {
      let otherPlayer = playerList[i];

      if(player !== otherPlayer
      && !otherPlayer.isDead
      && !otherPlayer.isGettingDamage
      && collision.circle_toCircle_withOffset(player, player.attkOffset_X, player.attkOffset_Y, player.attkRadius, otherPlayer)) {
         
         otherPlayer.isGettingDamage = true;
         otherPlayer.calcDamage = player.damageRnG();
         otherPlayer.health -= otherPlayer.calcDamage;

         setTimeout(() => otherPlayer.isGettingDamage = false, 0);
         
         if(otherPlayer.health <= 0) {

            playerDeath(otherPlayer);
            player.kills++;
            let socket = socketList[player.id];

            socket.emit("playerScore", {
               kills: player.kills,
               died: player.died,
            });
         }
      }
   }
}


// =====================================================================
// Player Death
// =====================================================================
const playerDeath = (player) => {
   
   player.health = 0;
   player.isDead = true;
   player.died++;
   player.deathCounts++;
   player.color = "blue"; // <== Debug Mode
   
   if(player.deathCounts === 10) player.deathCounts = 0;
   
   const respawnCooldown = setInterval(() => {
      player.respawnTimer --;
      
      if(player.respawnTimer <= 0) {

         player.isDead = false;
         player.isRespawning = true;

         // Reset Player Bars
         player.health = player.baseHealth;
         player.mana = player.baseMana;
         player.energy = player.baseEnergy;
         player.speedGcD = player.GcD;

         // Reset Respawn Timer
         player.respawnTimer = player.baseRespawnTimer;
         player.color = "darkviolet"; // <== Debug Mode

         // ================  Temporary  ================
         player.x = Math.floor(Math.random() * 1000) + 100; // <== Randomize position on respawn
         player.y = Math.floor(Math.random() * 700) + 50;
         // ================  Temporary  ================

         clearInterval(respawnCooldown);
      }
   }, 1000);
}


// =====================================================================
// Player Switch State
// =====================================================================
const playerSwitchState = (player) => {
   let isMoving = false;

   // Walk State
   if(player.up || player.down || player.left || player.right) {
      isMoving = true;
      
      if(!player.attackAnim) {

         if(player.isRunning && !player.isRunnable || !player.isRunning) {
            player.state = "walk";
            player.animation(frame, 1, 29);
         }
      }
   }

   // Run State
   if(isMoving && player.isRunning && player.isRunnable && !player.attackAnim) {
      player.state = "run";
      player.animation(frame, 1, 14);
   }

   // Attack State
   if(player.attackAnim) {
      player.state = "attack";
      player.animation(frame, 1, 14);
   }


   // ==================================================================
   
   // Heal State
   if(player.isHealing) {
      player.state = "heal";
      player.animation(frame, 1, 14);
      console.log("aze");
   }
   
   // Died State
   if(player.isDead) {
      player.state = "died";
      player.animation(frame, 1, 29);
   }
   
   // ==================================================================


   // Idle State
   else if(!isMoving && !player.attackAnim
   || player.up && player.down && !player.left && !player.right
   || player.left && player.right && !player.up && !player.down) {
      
      player.state = "idle";
      player.animation(frame, 2, 29);
   }
}


// =====================================================================
// Player Update (Every frame)
// =====================================================================
let frame = 0;

exports.playerUpdate = (socketList) => {
   let playerData = [];
   
   for(let i in playerList) {
      let player = playerList[i];
      
      if(!player.isDead) {
         
         playerSwitchState(player);
         playerGcD(player, socketList);
         playerMovements(player);
         playerRunning(player);
      }

      playerData.push(player);
   }

   frame++;
   return playerData;
}