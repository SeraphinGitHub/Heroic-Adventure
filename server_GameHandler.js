
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
const playerHandler = require("./server/server_PlayerHandler.js");
const minotaursHandler = require("./server/Enemies/server_MinotaursHandler.js");


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
let mobList = [];

minotaursHandler.initMinotaurs(mobList);


// =====================================================================
// Handle sockets connections
// =====================================================================
io.on("connection", (socket) => {
   // console.log("User connected !");
   
   // ==========  Generate ID  ==========
   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;
   playerHandler.onConnect(socket, socketList);


   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(process.env.DEBUG_MODE === "false") return;
      const response = eval(data);
      socket.emit("evalResponse", response);
   });   

   
   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      playerHandler.onDisconnect(socket);
      delete socketList[socket.id];
   });
});


// =====================================================================
// Server Sync
// =====================================================================
setInterval(() => {
   let playerData = playerHandler.playerUpdate(socketList, mobList);
   let minotaurData = minotaursHandler.minotaurUpdate();
   
   playerData.forEach(player => {

      let socket = socketList[player.id];
      socket.emit("newSituation", playerData, minotaurData);

      // Death Screen Event
      if(player.isDead && !player.isRespawning) {
         
         socket.emit("playerScore", {
            kills: player.kills,
            died: player.died,
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
}, 1000/process.env.FRAME_RATE);