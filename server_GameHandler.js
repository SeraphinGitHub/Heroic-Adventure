
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
let initPack_PlayerList_ID = [];

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
mobList = enemiesHandler.initEnemies();
mobList.forEach(enemy => initPack_MobList.push( enemy.initPack() ));


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

   for(let i in playerList) {
      let player = playerList[i];
      let socket = socketList[player.id];

      // initPack_PlayerList[eachPlayer.id] = player.initPack();
      initPack_PlayerList[player.id] = player;
      socket.emit("initPlayerPack", initPack_PlayerList);
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

   delete initPack_PlayerList[socket.id];
   delete playerList[socket.id];
}


// =====================================================================
// Server Sync
// =====================================================================
let frame = 0

setInterval(() => {

   // Light Update (draw enemies, player, NPC only inside viewport)
   {
      // *******************************
   
      // let mobData = [];
      // let otherPlayerData = [];
   
      // initPack_PlayerList_ID.forEach(player => {
   
      //    mobList_Light.forEach(mob => {
   
      //       // Collision square to circle ==> size of viewport
      //       if(collision(player, mob)) {
   
      //          mobData.push(mob);
      //       }
      //    });
   
   
      //    initPack_PlayerList_Light.forEach(otherPlayer => {
   
      //       // Collision square to circle ==> size of viewport
      //       if(player !== otherPlayer
      //       && collision(player, otherPlayer)) {
               
      //          otherPlayerData.push(otherPlayer);
      //       }
      //    });
   
      //    let socket = socketList[player.id];
      //    let clientIndex = initPack_PlayerList_Light.indexOf(player.id);
      //    let clientData = initPack_PlayerList_Light[clientIndex];
   
      //    socket.emit("mobData", mobData);
      //    socket.emit("otherPlayerData", otherPlayerData);
      //    socket.emit("clientData", clientData);
      // });
      
      // *******************************
   }

   // Light Update Pack
   let lightPack_PlayerList = [];
   let lightPack_MobList = [];
   let lightPack_NpcList = [];

   // Init Light: MobList
   mobList.forEach(enemy => enemy.update(frame, socketList, playerList, lightPack_MobList));

   // Init Light: PlayerList
   for(let i in playerList) {
      let player = playerList[i];
      player.update(socketList, initPack_PlayerList_ID, playerList, mobList, lightPack_PlayerList);
   }

   // Sending Light: PlayerList, MobList
   lightPack_PlayerList.forEach(player => {
      let socket = socketList[player.id];
      player.deathScreen(socket);
      socket.emit("serverSync", lightPack_PlayerList, lightPack_MobList);
   });
   
   frame++;

}, 1000/process.env.FRAME_RATE);