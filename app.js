
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


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
// Global Variables & Classes
// =====================================================================
const playerMax = 100;
let socketList = {};
let playerList = {};

class Player {
   constructor(id) {
      this.id = id;
      this.x = 150;
      this.y = 100;
      this.width = 80;
      this.height = 80;
      this.speed = 10;
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;
   }

   update() {
      if(this.up) this.y -= this.speed;
      if(this.down) this.y += this.speed;
      if(this.left) this.x -= this.speed;
      if(this.right) this.x += this.speed;
   }
}


// =====================================================================
// Handle sockets connections
// =====================================================================
io.on("connection", (socket) => {
   console.log("User connected !");  

   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;

   const player = new Player(socket.id);
   playerList[socket.id] = player;
   
   socket.on("disconnect", () => {
      console.log("User disconnected !");
      delete socketList[socket.id];
      delete playerList[socket.id];
   });
   
   socket.x = 0;
   socket.y = 0;

   socket.on("up", (data) => player.up = data);
   socket.on("down", (data) => player.down = data);
   socket.on("left", (data) => player.left = data);
   socket.on("right", (data) => player.right = data);
});


// =====================================================================
// Sync
// =====================================================================
setInterval(() => {
   let pack = [];

   for(let i in playerList) {
      let player = playerList[i];
      player.update();
      pack.push({
         x: player.x,
         y: player.y,
      });
   }

   for(let i in socketList) {
      let socket = socketList[i];
      socket.emit("newPosition", pack);
   }
}, 1000/30);