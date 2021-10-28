
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
// Player Global Count Down
// =====================================================================
const playerGcD = (player) => {
   if(player.speedGcD < player.baseGcD) player.speedGcD += process.env.SYNC_COEFF* 1 ;
   if(player.mana < player.baseMana) player.mana += player.regenMana; // Regen Mana

   if(player.speedGcD >= player.baseGcD) {

      if(player.isAttacking) {

         player.speedGcD = 0;
         player.isAttacking = false;
         playerAttack(player);
      }

      if(player.isCasting) {
         
         player.isCasting = false;
         playerHealing(player);
      }
   }
}


// =====================================================================
// Player Movements
// =====================================================================
const playerMovements = (player) => {

   if(!player.isDead) {
      
      let moveSpeed = player.walkSpeed;
      if(player.isRunning) moveSpeed = player.runSpeed;
      
      // Cross
      if(player.up && player.y > 50) {
      // if(player.up) {
         player.y -= moveSpeed;
         player.attkOffset_X = 0;
         player.attkOffset_Y = -player.attkOffset;
      }
      
      if(player.down && player.y < 750) {
      // if(player.down) {
         player.y += moveSpeed;
         player.attkOffset_X = 0;
         player.attkOffset_Y = player.attkOffset;
      }
      
      if(player.left && player.x > 50) {
      // if(player.left) {
         player.x -= moveSpeed;
         player.attkOffset_X = -player.attkOffset;
         player.attkOffset_Y = 0;
      }
      
      if(player.right && player.x < 1150) {
      // if(player.right) {
         player.x += moveSpeed;
         player.attkOffset_X = player.attkOffset;
         player.attkOffset_Y = 0;
      }
      
      // Diagonale
      if(player.up && player.left) {
         player.attkOffset_X = -player.attkOffset;
         player.attkOffset_Y = -player.attkOffset;
      }

      if(player.up && player.right) {
         player.attkOffset_X = player.attkOffset;
         player.attkOffset_Y = -player.attkOffset;
      }

      if(player.down && player.left) {
         player.attkOffset_X = -player.attkOffset;
         player.attkOffset_Y = player.attkOffset;
      }

      if(player.down && player.right) {
         player.attkOffset_X = player.attkOffset;
         player.attkOffset_Y = player.attkOffset;
      }
      
      // Diag Speed
      if(player.up && player.left
      ||player.up && player.right
      ||player.down && player.left
      ||player.down && player.right) {
         moveSpeed = Math.sqrt(moveSpeed);
      }
   }
}


// =====================================================================
// Player Running
// =====================================================================
const playerRunning = (player) => {
   if(player.energy < player.baseEnergy) player.energy += player.regenEnergy;

   if(player.isRunning) {

      player.energy -= player.energyCost;
      if(player.energy < player.energyCost) player.isRunning = false;
      if(player.energy <= 0) player.energy = 0;
   }
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
// Player Attack
// =====================================================================
const playerAttack = (player) => {
   
   damagingEnemy(player);
   // damagingEnemy(player, mobList); // <== When Mob class gonna be created
}


// =====================================================================
// Damaging Enemy
// =====================================================================
const damagingEnemy = (player) => {

   for(let i in playerList) {
      let otherPlayer = playerList[i];

      if(player !== otherPlayer
      && !player.isDead
      && !otherPlayer.isDead
      && !otherPlayer.isGettingDamage
      && collision.circle_toCircle_withOffset(player, player.attkOffset_X, player.attkOffset_Y, player.attkRadius, otherPlayer)) {
         
         otherPlayer.isGettingDamage = true;
         otherPlayer.calcDamage = player.damageRnG();
         otherPlayer.health -= otherPlayer.calcDamage;
         
         setTimeout(() => otherPlayer.isGettingDamage = false, 0);
         if(otherPlayer.health <= 0) playerDeath(otherPlayer);
      }
   }
}


// =====================================================================
// Player Death
// =====================================================================
const playerDeath = (player) => {
   
   player.health = 0;
   player.isDead = true;
   player.deathCounts++;
   player.color = "blue"; // <== Debug Mode
   
   if(player.deathCounts === 10) player.deathCounts = 0;
   
   const respawnCooldown = setInterval(() => {
      player.respawnTimer --;
      
      if(player.respawnTimer < 0) {

         player.isDead = false;
         player.health = player.baseHealth;
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
// Player Update (Every frame)
// =====================================================================
exports.playerUpdate = () => {
   let playerData = [];
   
   for(let i in playerList) {
      let player = playerList[i];

      playerGcD(player);
      playerMovements(player);
      playerRunning(player);

      playerData.push(player);
   }
   return playerData;
}