
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
// Global Variables
// =====================================================================
const DEBUG = true;

const playerMax = 100;
let socketList = {};
let playerList = {};


// =====================================================================
// Collision
// =====================================================================
const squareCollision = (first, second) => {
   if(!(first.x > second.x + second.width
      ||first.x + first.width < second.x
      ||first.y > second.y + second.height
      ||first.y + first.height < second.y)) {
         return true;
   }
}

const circleCollision = (first, second) => {
   let dx = second.x - first.x;
   let dy = second.y - first.y;
   let distance = Math.sqrt(dx * dx + dy * dy);
   let sumRadius = first.radius + second.radius;

   if(distance <= sumRadius) return true;
}


// =====================================================================
// Classes
// =====================================================================
class Player {
   constructor(id) {
      this.id = id;
      this.speed = 7;
      this.runSpeed = 15;
      this.health = 100;
      this.damage = 15;

      this.x = 150;
      this.y = 100;
      this.radius = 60;
      this.angle = 0;

      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      this.isDead = false;
      this.isRunning = false;
      this.isAttacking = false;
   }

   update() {
      let speed = this.speed;
      let runSpeed = this.runSpeed;

      if(this.isRunning) speed = runSpeed;

      if(this.up) this.y -= speed;
      if(this.down) this.y += speed;
      if(this.left) this.x -= speed;
      if(this.right) this.x += speed;

      if(this.up && this.left
      ||this.up && this.right
      ||this.down && this.left
      ||this.down && this.right) {
         speed *= 0.7;
      }
   }

   death() {
      this.speed = 0;
      this.health = 0
      this.damage = 0;
      this.isDead = true;
   }
}


// =====================================================================
// Player Situation
// =====================================================================
Player.onConnect = (socket) => {
   const player = new Player(socket.id);
   playerList[socket.id] = player;

   socket.on("up", (data) => player.up = data);
   socket.on("down", (data) => player.down = data);
   socket.on("left", (data) => player.left = data);
   socket.on("right", (data) => player.right = data);

   socket.on("running", (data) => player.isRunning = data);
   socket.on("attack", (data) => player.isAttacking = data);
}

Player.OnDisconnect = (socket) => {
   delete playerList[socket.id];
}

Player.updateSituation = () => {
   let pack = [];

   for(let i in playerList) {
      let player = playerList[i];
      
      if(player.isAttacking) {
         player.isAttacking = false;

         for(let j in playerList) {
            let otherPlayer = playerList[j];

            if(player !== otherPlayer && circleCollision(player, otherPlayer)) {
               otherPlayer.health -= player.damage;
               if(otherPlayer.health <= 0) otherPlayer.death();
            }
         }
      }
      
      player.update();
      pack.push(player);
   }
   return pack;
}


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
   Player.onConnect(socket);   
   

   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      // console.log("User disconnected !");
      delete socketList[socket.id];
      Player.OnDisconnect(socket);
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
   let pack = Player.updateSituation();
   
   for(let i in socketList) {
      let socket = socketList[i];
      socket.emit("newSituation", pack);
   }
}, 1000/60);