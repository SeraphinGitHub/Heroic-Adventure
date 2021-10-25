
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
let treeList = {};


// =====================================================================
// Player connection
// =====================================================================
exports.onConnect = (socket) => {
   const player = new Player(socket.id);
   playerList[socket.id] = player;


   // ==========================  Temporary  ==========================

   // const tree = new Tree();
   // treeList[tree] = tree;

   // for(let i in treeList) {
   //    let tree = treeList[i];
   //    socket.emit("connected", tree);
   // }
   
   // =================================================================


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





// ==========================  Temporary  ==========================

const playerMovements = (player) => {
   
   for(let i in treeList) {
      let tree = treeList[i];

      if(collision.circle_toCircle_withOffset(tree, tree.offsetX, tree.offsetY, tree.radius, player)) {
         player.walkSpeed = 1;
         // player.runSpeed = 0;
      }

      else player.walkSpeed = player.baseWalkSpeed;
   }

}

// ==========================  Temporary  ==========================




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

   if(player.mana < player.baseMana) player.mana += player.regenMana;

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
const playerAttack = (player) => {

   if(player.attackCooldown < player.baseAttackCooldown) player.attackCooldown += player.attackSpeed;
   if(player.attackCooldown > player.baseAttackCooldown) player.attackCooldown = player.baseAttackCooldown;

   if(player.isAttacking && player.attackCooldown === player.baseAttackCooldown) {  

      player.isAttacking = false;
      player.attackCooldown = 0;
      damagingEnemy(player, playerList);
      // damagingEnemy(player, mobList); // <== When Mob class gonna be created
   }
}


// =====================================================================
// Damaging Enemy
// =====================================================================
const damagingEnemy = (player, enemyList) => {

   for(let i in enemyList) {
      let enemy = enemyList[i];

      if(player !== enemy
      && !player.isDead
      && !enemy.isDead
      && !enemy.isGettingDamage
      && collision.circle_toCircle_withOffset(player, player.attkOffset_X, player.attkOffset_Y, player.attkRadius, enemy)) {
         
         enemy.isGettingDamage = true;
         enemy.calcDamage = player.damageRnG();
         enemy.health -= enemy.calcDamage;
   
         setTimeout(() => enemy.isGettingDamage = false, 0);
         if(enemy.health <= 0) enemy.death();
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
      playerAttack(player);

      // playerMovements(player);

      player.update();
      playerData.push(player);
   }
   return playerData;
}