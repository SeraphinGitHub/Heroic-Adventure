
"use strict"

// =====================================================================
// Scrips import
// =====================================================================
const Player = require("./classes/Player.js");
const collision = require("./collisions.js");


// =====================================================================
// Global Variables
// =====================================================================
let playerList = {};


// =====================================================================
// Player connection
// =====================================================================
exports.onConnect = (socket) => {
   const player = new Player(socket.id);
   playerList[socket.id] = player;

   socket.on("up", data => player.up = data);
   socket.on("down", data => player.down = data);
   socket.on("left", data => player.left = data);
   socket.on("right", data => player.right = data);

   socket.on("run", data => player.isRunning = data);
   socket.on("attack", data => player.isAttacking = data);
   socket.on("heal", data => player.isHealing = data);
}


// =====================================================================
// Player disconnection
// =====================================================================
exports.onDisconnect = (socket) => {
   delete playerList[socket.id];
}


// =====================================================================
// Player Running
// =====================================================================
const playerRunning = (player) => {
   
   if(player.energy < player.baseEnergy) player.energy += player.regenEnergy;
   if(player.energy > player.baseEnergy) player.energy = player.baseEnergy;

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
   
   if(player.mana < player.baseMana) player.mana += player.regenMana;
   if(player.mana > player.baseMana) player.mana = player.baseMana;
   
   if(player.isHealing && player.mana >= player.spellCost && player.health < player.baseHealth) {
      player.isHealing = false;

      player.calcHealing = player.healRnG();
      player.health += player.calcHealing;
      player.mana -= player.spellCost;

      if(player.health > player.baseHealth) player.health = player.baseHealth;
   }
}


// =====================================================================
// Player Attack
// =====================================================================
const playerAttack = (player, damagingOtherPlayer) => {
   
   if(player.attackCooldown < player.baseAttackCooldown) player.attackCooldown += player.attackSpeed;
   if(player.attackCooldown > player.baseAttackCooldown) player.attackCooldown = player.baseAttackCooldown;
   
   if(player.isAttacking && player.attackCooldown === player.baseAttackCooldown) {  

      player.isAttacking = false;
      player.attackCooldown = 0;
      damagingOtherPlayer(player)
   }
}


// =====================================================================
// Damaging Other PLayer
// =====================================================================
const damagingOtherPlayer = (player) => {

   for(let j in playerList) {
      let otherPlayer = playerList[j];

      if(player !== otherPlayer
      && !player.isDead
      && !otherPlayer.isDead
      && !otherPlayer.isGettingDamage
      && collision.circle_toCircle_Collision(player, otherPlayer)) {
         
         otherPlayer.isGettingDamage = true;
         otherPlayer.calcDamage = player.damageRnG();
         otherPlayer.health -= otherPlayer.calcDamage;
   
         setTimeout(() => otherPlayer.isGettingDamage = false, 0);
         if(otherPlayer.health <= 0) otherPlayer.death();
      }
   }
}


// =====================================================================
// Player update
// =====================================================================
exports.updateSituation = () => {
   let playerData = [];
   
   for(let i in playerList) {
      let player = playerList[i];

      playerRunning(player);
      playerHealing(player);
      playerAttack(player, damagingOtherPlayer);

      player.update();
      playerData.push(player);
   }
   return playerData;
}