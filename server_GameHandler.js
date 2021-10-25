
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


// =====================================================================
// App init
// =====================================================================
app.get("/", (req, res) => {
   res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(process.env.PORT || 3000, () => {
   // console.log(`Listening on port ${process.env.PORT}`);
   console.log(`Listening on port ${3000}`);
});


// =====================================================================
// Global Variables
// =====================================================================
const DEBUG_MODE = process.env.DEBUG_MODE;
const playerMax = 100;
let socketList = {};


// =====================================================================
// Handle sockets connections
// =====================================================================
io.on("connection", (socket) => {
   // console.log("User connected !");  
   
   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(DEBUG_MODE === "false") return;
      const response = eval(data);
      socket.emit("evalResponse", response);
   });


   // ==========  Generate ID  ==========
   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;
   playerHandler.onConnect(socket);   
   

   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      delete socketList[socket.id];
      playerHandler.onDisconnect(socket);
   });


   // ==========  Chatting  ==========
   socket.on("sendMessage", (data) => {
      const playerName = socket.id;
      for(let i in socketList) {
         socketList[i].emit("addMessage", `${playerName} : ${data}`);
      }
   });


   // ==========  Toggle Death Screen  ==========
   socket.on("death", (respawnSpec) => {
      let player = socketList[respawnSpec.id];
      if(player) player.emit("showDeathScreen", respawnSpec);
   });

   socket.on("respawn", (id) => {
      let player = socketList[id];
      if(player) player.emit("hideDeathScreen");
   });
});


// =====================================================================
// Server Sync
// =====================================================================
setInterval(() => {
   let playerData = playerHandler.playerUpdate();

   for(let i in socketList) {
      let socket = socketList[i];
      socket.emit("newSituation", playerData);
   }

   playerData.forEach(player => {
      let socket = socketList[player.id];
      
      if(player.isDead) socket.emit("playerDeath", {
         respawnTimer: player.respawnTimer,
         deathCounts: player.deathCounts
      });      
   });
}, 1000/60);