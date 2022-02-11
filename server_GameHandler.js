
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
const Player = require("./server/Player.js");
const Enemy = require("./server/Enemy.js");


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
// Players connections
// =====================================================================

// Handle sockets connections
io.on("connection", (socket) => {
   // console.log("User connected !");
   
   // ==========  Generate ID  ==========
   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;
   onConnect(socket, socketList, playerList);

   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(process.env.DEBUG_MODE === "false") return;
      const response = eval(data);
      socket.emit("evalResponse", response);
   });   

   
   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      onDisconnect(socket, playerList);
      delete socketList[socket.id];
   });
});

// Player connection
const onConnect = (socket) => {
   const player = new Player(socket.id);
   playerList[socket.id] = player;

   for(let i in playerList) {
      let player = playerList[i];
      let socket = socketList[player.id];
      socket.emit("initPlayerPack", playerList);
   };
   
   // ================================
   // Init Player
   // ================================
   socket.on("playerName", (data) =>  {
      
      player.name = data;

      socket.emit("playerStats", {
   
         playerID: player.id,
         name: data,
         health: player.baseHealth,
         mana: player.baseMana,
         regenMana: player.baseRegenMana,
         energy: player.baseEnergy,
         regenEnergy: player.baseRegenEnergy,
         GcD: player.baseGcD,
      });
      
      socket.emit("playerScore", {
         
         kills: player.kills,
         died: player.died,
         fame: player.fame,
         fameCount: player.fameCount,
      });
      
      socket.emit("fameCount+1", player.fameCount);
   });
   

   // ================================
   // Receive Chat
   // ================================
   let receiverID;
   let receiverName;

   // General Chat
   socket.on("generalMessage", (textMessage) => {
      for(let i in socketList) socketList[i].emit("addMessage_General", `${player.name}: ${textMessage}`);
   });
   
   // Private Chat
   socket.on("privateMessage", (textMessage) => {
      const prefix = "To >";
      let receiver = socketList[receiverID];
      
      if(receiver) {
         receiver.emit("addMessage_Private", `${player.name}: ${textMessage}`);
         socket.emit("addMessage_Private", `${prefix}${receiverName}: ${textMessage}`);
      }
      else socket.emit("addMessage_Private", `>${receiverName}< Has gone offline !`);
   });
   
   // Get reveiver ID for private chat 
   socket.on("chatReceiverName", (name) => {
      receiverName = name;
      
      for(let i in playerList) {
         let receiver = playerList[i];
         if(receiver.name === name) receiverID = receiver.id;
      }
   });


   // ================================
   // Receive Player States
   // ================================
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

// Player disconnection
const onDisconnect = (socket) => {

   let loggedOutPlayer = playerList[socket.id];
   
   for(let i in playerList) {
      let player = playerList[i];
      let socket = socketList[player.id];
      socket.emit("removePlayerPack", loggedOutPlayer);
   };

   delete playerList[socket.id];
}


// =====================================================================
// Enemies
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
      respawnTime: 10 *1000,
      damages: 15,
      attackDelay: 0.5,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,
      animArray: minotaursAnim,
   }

   cycleEnemiesPos(minotaursSpawns, minotaursSpecs);
}

// Init Enemies
const cycleEnemiesPos = (enemySpawnObj, enemySpecs) => {

   enemySpawnObj.forEach(position => {
      const enemy = new Enemy(position.x, position.y, enemySpecs);
      mobList.push(enemy);
   });
}

const initEnemies = () => {

   set_Minotaurs();   
}

initEnemies();


// =====================================================================
// Server Sync
// =====================================================================
let frame = 0

setInterval(() => {
   let playerData = [];
   let enemiesData = [];

   mobList.forEach(enemy => enemy.update(frame, socketList, playerList, enemiesData));

   for(let i in playerList) {
      let player = playerList[i];
      player.update(socketList, playerList, mobList, playerData);
   }
   
   playerData.forEach(player => {
      
      let socket = socketList[player.id];
      socket.emit("serverSync", playerData, enemiesData);

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