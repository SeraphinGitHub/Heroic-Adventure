
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
let playersID = 0;

io.on("connection", (socket) => {
   // console.log("User connected !");

   // ==========  Generate ID  ==========
   // socket.id = Math.floor(playerMax * Math.random());
   socket.id = playersID++;

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

   // ================================
   // Init Player
   // ================================
   socket.on("send_initClient", (data) =>  {
      socket.emit("received_initClient", player.id);
      
      player.name = data;
      socket.emit("initEnemyPack", initPack_MobList);
      socket.emit("fameCount", player.fameCount);

      socket.emit("playerStats", {
         
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
      

      // ================================
      // Sending initPack Player
      // ================================
      for(let i in playerList) {
         let player = playerList[i];         
         initPack_PlayerList[player.id] = player.initPack();
      };

      for(let i in playerList) {
         let player = playerList[i];
         let socket = socketList[player.id];
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

   let player = playerList[socket.id];
   let initPlayer = initPack_PlayerList[player.id];
   
   for(let i in playerList) {
      let player = playerList[i];
      let socket = socketList[player.id];
      socket.emit("removePlayerPack", initPlayer);
   };

   delete initPack_PlayerList[player.id];
   delete playerList[socket.id];
}

 
// =====================================================================
// Server Sync
// =====================================================================
let frame = 0

const set_DetectViewport = (player) => {
   return {
      x: player.x -player.detectViewport.width /2,
      y: player.y -player.detectViewport.height /2,
      height: player.detectViewport.height,
      width: player.detectViewport.width,
   }
}

setInterval(() => {
   
   // ===================================
   // Init Light Packs
   // ===================================
   let lightPack_PlayerList = {};
   let lightPack_MobList = [];
   
   let mob_Collision = [];
   let mob_PlayerList = {};
   let mob_SocketList = {};


   // Mobs
   mobList.forEach(mob => {
      for(let i in playerList) {
   
         let player = playerList[i];
         let socket = socketList[player.id];
         
         const playerViewport = set_DetectViewport(player);

         const mobHitBox = {
            x: mob.x,
            y: mob.y,
            radius: mob.wanderRange + mob.radius,
         }
      
         if(player.square_toCircle(playerViewport, mobHitBox)) {
         
            if(!mob_Collision.includes(mob)) mob_Collision.push(mob);
            mob_PlayerList[socket.id] = player;
            mob_SocketList[player.id] = socket;
         }
      }

      mob.update(frame, mob_SocketList, mob_PlayerList, lightPack_MobList);
   });

   // Players
   for(let i in playerList) {

      let player = playerList[i];
      let socket = socketList[player.id];

      player.update(socketList, playerList, mob_Collision, lightPack_PlayerList);
      player.deathScreen(socket);      
   }


   // ===================================
   // Sending Light Packs
   // ( Update: Enemies, Players, NPCs only inside Client viewport )
   // ===================================
   for(let i in playerList) {
      
      let playersToRender = [];
      let mobsToRender = [];

      let player = playerList[i];
      let lightPlayer = lightPack_PlayerList[i];
      let socket = socketList[player.id];      
      
      // Add first player to Render
      playersToRender.push(lightPlayer);

      const playerViewport = set_DetectViewport(player);

      // Set Mobs to Render in Client
      for(let i = 0; i < mobList.length; i++) {
      
         let mob = mobList[i];
         let lightMob = lightPack_MobList[i];
   
         const mobHitBox = {
            x: mob.x,
            y: mob.y,
            radius: mob.wanderRange + mob.radius,
         }
   
         if(player.square_toCircle(playerViewport, mobHitBox)) mobsToRender.push(lightMob);
      }

      // Set Players to Render in Client
      for(let i in playerList) {
      
         let other_player = playerList[i];
         let other_LightPlayer = lightPack_PlayerList[i];
         
         if(player !== other_player) {
            
            const otherPlayerHitBox = {
               x: other_player.x,
               y: other_player.y,
               radius: other_player.radius,
            }

            if(player.square_toCircle(playerViewport, otherPlayerHitBox)) playersToRender.push(other_LightPlayer);
         }
      }      

      // Sending Light Packs: Players, Mobs
      socket.emit("serverSync", playersToRender, mobsToRender);

      // console.log(playersToRender.length); // ******************************************************
   }
   
   frame++;
   if(process.env.SHOW_FPS) frameRate++;

}, 1000/process.env.DEPLOY_FRAME_RATE);


let frameRate = 0;

if(process.env.SHOW_FPS === "true") {
   setInterval(() => {
      console.log(frameRate);
      frameRate = 0;
   }, 1000);
}