
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
const Player = require("./server/classes/Player.js");
const enemiesHandler = require("./server/server_EnemiesHandler.js");


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

// Init Pack
let initPack_PlayerList = {};
let initPack_MobList = [];
let initPack_NpcList = [];

// Normal Pack
let playerList = {};
let mobList = [];
let npcList = [];


// =====================================================================
// Init Enemies
// =====================================================================
let enemyID = 0;
mobList = enemiesHandler.initEnemies();

mobList.forEach(enemy => {
   enemyID++;
   enemy.id = enemyID;
   initPack_MobList.push(enemy.initPack());
});


// =====================================================================
// Players connections
// =====================================================================

// Handle sockets connections
io.on("connection", (socket) => {
   // console.log("User connected !");
   

   // ==========  Generate ID  ==========
   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;
   onConnect(socket);


   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(process.env.DEBUG_MODE === "false") return;
      const response = eval(data);
      socket.emit("evalResponse", response);
   });   


   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      onDisconnect(socket);
      delete socketList[socket.id];
   });
});

// Player connection
const onConnect = (socket) => {

   const player = new Player(socket.id);
   playerList[socket.id] = player;
   socket.emit("initEnemyPack", initPack_MobList);


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

      // ================================
      // Sending initPack Player
      // ================================
      for(let i in playerList) {

         let player = playerList[i];
         let socket = socketList[player.id];
         
         initPack_PlayerList[player.id] = player.initPack();
         socket.emit("initPlayerPack", initPack_PlayerList);
      };
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

   delete initPack_PlayerList[socket.id];
   delete playerList[socket.id];
}


// =====================================================================
// Server Sync
// =====================================================================
let frame = 0

setInterval(() => {

   let socketsArray = [];
   
   // LightPack (Every frame)
   let lightPack_PlayerList = [];
   let lightPack_MobList = [];
   let lightPack_NpcList = [];
   



   // Light Update (draw enemies, player, NPC only inside viewport)   
   let otherPlayerData = [];
   let mobData = [];

   // mobList.forEach(enemy => enemy.update(frame, socketList, playerList, lightPack_MobList));

   for(let i in playerList) {
      
      let player = playerList[i];
      let socket = socketList[player.id];
      
      socketsArray.push(socket);

      // let clientIndex = lightPack_PlayerList.indexOf(player.id);
      // let clientData = lightPack_PlayerList[clientIndex];

      const square = {
         x: player.x -player.detectViewport.width /2,
         y: player.y -player.detectViewport.height /2,
         height: player.detectViewport.height,
         width: player.detectViewport.width,
      }

      mobList.forEach(mob => {

         const circle = {
            x: mob.spawnX,
            y: mob.spawnY,
            radius: mob.wanderRange + mob.radius,
         }
   
         if(player.square_toCircle(square, circle)) {
            
            mob.update(frame, socketList, playerList, lightPack_MobList)
         }      
      });


      for(let i in playerList) {
         let otherPlayer = playerList[i];

         // Collision square to circle ==> size of viewport
         if(player !== otherPlayer) {
            
            const circle = {
               x: otherPlayer.x,
               y: otherPlayer.y,
               raduis: otherPlayer.radius,
            }

            if(player.square_toCircle(square, circle)) {
               
               // otherPlayerData.push(otherPlayer);

               // otherPlayer.update(socketList, playerList, mobList, lightPack_PlayerList);
               // otherPlayer.deathScreen(socket);
            }
         }
      }

      player.update(socketList, playerList, mobList, lightPack_PlayerList);
      player.deathScreen(socket);
       

      // socket.emit("mobData", mobData);
      // socket.emit("otherPlayerData", otherPlayerData);
      // socket.emit("clientData", clientData);
   }

   
   socketsArray.forEach(socket => socket.emit("serverSync", lightPack_PlayerList, lightPack_MobList));
   // *******************************
   // *******************************

   

   // // Init LightPack: Mobs
   // mobList.forEach(enemy => enemy.update(frame, socketList, playerList, lightPack_MobList));

   // // Init LightPack: Players
   // for(let i in playerList) {

   //    let player = playerList[i];
   //    let socket = socketList[player.id];
   //    socketsArray.push(socket);
      
   //    player.update(socketList, playerList, mobList, lightPack_PlayerList);
   //    player.deathScreen(socket);      
   // }

   // // Sending LightPack: Players, Mobs
   // socketsArray.forEach(socket => socket.emit("serverSync", lightPack_PlayerList, lightPack_MobList));
   
   frame++;

}, 1000/process.env.FRAME_RATE);