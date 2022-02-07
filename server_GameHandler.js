
"use strict"

require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// =====================================================================
// Scrips import
// =====================================================================
// const Player = require("./server/classes/Player.js");
const Enemy = require("./server/classes/Enemy.js");
const playerHandler = require("./server/server_PlayerHandler.js");


// =====================================================================
// App init
// =====================================================================
app.get("/", (req, res) => {
   res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 3000, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});


// =====================================================================
// Global Variables
// =====================================================================
const playerMax = 300;
let socketList = {};
let playerList = {};
let mobList = [];


// =====================================================================
// Handle sockets connections
// =====================================================================
io.on("connection", (socket) => {
   // console.log("User connected !");
   
   // ==========  Generate ID  ==========
   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;
   playerHandler.onConnect(socket, socketList, playerList);


   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(process.env.DEBUG_MODE === "false") return;
      const response = eval(data);
      socket.emit("evalResponse", response);
   });   

   
   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      playerHandler.onDisconnect(socket, playerList);
      delete socketList[socket.id];
   });
});


// =====================================================================
// Cycle Enemies Positions
// =====================================================================
const G_Variables = {

   frameRate: process.env.FRAME_RATE,
   synCoeff: process.env.SYNC_COEFF,
   socketList: socketList,
   playerList: playerList,
   mobList: mobList,
}

const cycleEnemiesPos = (enemySpawnObj, enemySpecs) => {

   enemySpawnObj.forEach(position => {
      const enemy = new Enemy(position.x, position.y, enemySpecs, G_Variables);
      mobList.push(enemy);
   });
}


// =====================================================================
// Set Minotaurs
// =====================================================================
const set_Minotaurs = () => {

   const minotaursSpawns = [
      {x: 700, y: 600},
      // {x: 1500, y: 600},
      // {x: 1000, y: 1200},
   ];

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

   const minotaursSpecs = {

      health: 150,
      radius: 55,
      wanderRange: 120,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      GcD: 60,
      getFameCost: 100,
      looseFameCost: 200,
      hiddenTime: 4 *1000,
      respawnTime: 1 *1000,
      damages: 15,
      attackDelay: 0.5,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,
      animArray: minotaursAnim,
   }

   cycleEnemiesPos(minotaursSpawns, minotaursSpecs);
}


// =====================================================================
// Init Enemies
// =====================================================================
const initEnemies = () => {

   set_Minotaurs();   
}

initEnemies();


const enemyUpdate = (frame) => {

   let enemyData = [];

   for(let i in mobList) {
      let enemy = mobList[i];

      if(!enemy.isDead) {

         enemy.calcGcD();
         enemy.movements();
         enemy.sateMachine();
      }
      
      enemy.animState(frame);
      enemyData.push(enemy);
   }
   
   return enemyData;
}

// =====================================================================
// Server Sync
// =====================================================================
let frame = 0

setInterval(() => {
   let playerData = playerHandler.playerUpdate(frame, socketList, playerList, mobList);
   let enemiesData = enemyUpdate(frame);

   playerData.forEach(player => {

      let socket = socketList[player.id];
      socket.emit("newSituation", playerData, enemiesData);

      // Death Screen Event
      if(player.isDead && !player.isRespawning) {
         
         socket.emit("playerScore", {
            kills: player.kills,
            died: player.died,
            fame: player.fame,
            fameCount: player.fameCount,
         });

         socket.emit("playerDeath", {
            respawnTimer: player.respawnTimer,
            deathCounts: player.deathCounts
         });
      }

      else if(!player.isDead && player.isRespawning) {
         player.isRespawning = false;
         socket.emit("playerRespawn");
      }
   });

   frame++;

}, 1000/process.env.FRAME_RATE);