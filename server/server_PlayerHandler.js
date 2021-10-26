
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

   // const treeBottom = new Tree(200, 400);
   // const treeTop = new Tree(800, 200);

   // treeList["treeBottom"] = treeBottom;
   // treeList["treeTop"] = treeTop;

   // socket.emit("treeList", treeList);

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

// const stopMove_onCollide = (player) => {
   
//    for(let i in treeList) {
//       let tree = treeList[i];

//       if(collision.circle_toCircle_withOffset(tree, tree.offsetX, tree.offsetY, tree.radius, player)) {
//          player.walkSpeed = 1;
//          player.runSpeed = 2;
//       }

//       else {
//          player.walkSpeed = player.baseWalkSpeed;
//          player.runSpeed = player.baseRunSpeed;
//       }
//    }

// }

// ==========================  Temporary  ==========================




// =====================================================================
// Player Movements
// =====================================================================
const playerMovements = (player) => {

   if(!player.isDead) {

      let moveSpeed;
      if(!player.isRunning) moveSpeed = player.walkSpeed;
      else moveSpeed = player.runSpeed;
      
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

   if(player.isAttacking && player.canAttack) {  

      player.isAttacking = false;
      player.canAttack = false;

      damagingEnemy(player);
      // damagingEnemy(player, mobList); // <== When Mob class gonna be created

      const attackCooldown = setInterval(() => {
         player.attackCooldown --;

         if(player.attackCooldown <= 0) {
            player.canAttack = true;
            player.attackCooldown = player.attackSpeed;
            clearInterval(attackCooldown);
         }
      }, 1);
   }
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

      playerMovements(player);
      playerRunning(player);
      playerHealing(player);
      playerAttack(player);

      // stopMove_onCollide(player);

      playerData.push(player);
   }
   return playerData;
}