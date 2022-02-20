
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

// Normal Pack
let playerList = {};
let mobList = [];


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
// Init Players
// =====================================================================
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
   
   let mob_Collision = [];
   let player_Collision = [];
   let lightPack_MobList = [];
   let lightPack_PlayerList = [];

   // Set Detected Viewport Collisions
   for(let i in playerList) {
      let player = playerList[i];
      let socket = socketList[player.id];

      const playerAlone = {
         player: player,
         socket: socket,
      }

      const playerViewport = {
         x: player.x -player.detectViewport.width /2,
         y: player.y -player.detectViewport.height /2,
         height: player.detectViewport.height,
         width: player.detectViewport.width,
      }

      // Parse mobList ==> Player collide Mobs
      mobList.forEach(mob => {

         const mobHitBox = {
            x: mob.x,
            y: mob.y,
            radius: mob.wanderRange + mob.radius,
         }

         const collision = {
            player: player,
            socket: socketList[player.id],
            mob: mob,
         }
         
         // Mob enter inside Detect Viewport
         if(player.square_toCircle(playerViewport, mobHitBox)) {
            if(!mob_Collision.includes(collision)) mob_Collision.push(collision);
         }
      });

      // Parse playerList ==> Player collide otherPlayers
      for(let i in playerList) {
         let otherPlayer = playerList[i];
         
         if(player !== otherPlayer) {
            const otherPlayerHitBox = {
               x: otherPlayer.x,
               y: otherPlayer.y,
               radius: otherPlayer.radius,
            }

            const collision = {
               player: player,
               socket: socket,
               otherPlayer: otherPlayer,
               otherSocket: socketList[otherPlayer.id],
            }
            
            // Other Player enter inside Detect Viewport
            if(player.square_toCircle(playerViewport, otherPlayerHitBox)) {
               if(!player_Collision.includes(collision)) player_Collision.push(collision);
            }
            else if(!player_Collision.includes(playerAlone)) player_Collision.push(playerAlone);
         }
      }

      // Only one player connected
      if(Object.keys(playerList).length === 1) {
         if(!player_Collision.includes(playerAlone)) player_Collision.push(playerAlone);
      }
   }

   // Mobs to Render in Client 
   mob_Collision.forEach(collision => {
      collision.mob.update(frame, collision.socket, collision.player, lightPack_MobList);
   });

   // Players to Render in Client
   player_Collision.forEach(collision => {
      
      if(!collision.otherPlayer) {
         collision.player.update(collision.socket, {}, {}, mob_Collision, lightPack_PlayerList);
         collision.player.deathScreen(collision.socket);
      }
      
      else {
         collision.otherPlayer.update(collision.otherSocket, collision.socket, collision.player, mob_Collision, lightPack_PlayerList);
         collision.otherPlayer.deathScreen(collision.socket);
      }
   });


   // Sending Light Packs: Players, Mobs
   for(let i in playerList) {
      
      let player = playerList[i];
      let socket = socketList[player.id];
            
      socket.emit("serverSync", lightPack_PlayerList, lightPack_MobList);
   };

   frame++;

}, 1000/process.env.FRAME_RATE);