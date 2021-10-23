
"use strict"

// =====================================================================
// Scrips import
// =====================================================================
const Player = require("../classes/Player.js");
const collision = require("../collisions.js");


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
}


// =====================================================================
// Player disconnection
// =====================================================================
exports.onDisconnect = (socket) => {
   delete playerList[socket.id];
}


// =====================================================================
// Player update
// =====================================================================
exports.updateSituation = () => {
   let pack = [];
   
   for(let i in playerList) {
      let player = playerList[i];
      
      if(player.isAttacking) {
         player.isAttacking = false;

         for(let j in playerList) {
            let otherPlayer = playerList[j];

            if(player !== otherPlayer && collision.circleCollision(player, otherPlayer)) {
               otherPlayer.health -= player.damage;
               if(otherPlayer.health <= 0) otherPlayer.death();
            }
         }
      }
      
      player.update();
      pack.push(player);
   }
   return pack;
}