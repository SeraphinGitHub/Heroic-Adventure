
"use strict"

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


// =====================================================================
// Scrips import
// =====================================================================
const playerHandler = require("./server/characters/playerHandler.js");


// =====================================================================
// App init
// =====================================================================
app.get("/", (req, res) => {
   res.sendFile(__dirname + "/client/index.html");
});

app.use("/client", express.static(__dirname + "/client"));

server.listen(3000, () => {
   console.log("Listening on port 3000");
});


// =====================================================================
// Global Variables
// =====================================================================
const DEBUG = true; // <==

const playerMax = 100;
let socketList = {};


// =====================================================================
// Handle sockets connections
// =====================================================================
io.on("connection", (socket) => {
   // console.log("User connected !");  

   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(!DEBUG) return;
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
});


// =====================================================================
// Sync
// =====================================================================
setInterval(() => {
   let playerData = playerHandler.updateSituation();
   
   for(let i in socketList) {
      let socket = socketList[i];
      socket.emit("newSituation", playerData);
   }
}, 1000/60);