
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
const DEBUG = true;

const playerMax = 100;
let socketList = {};
let playerList = {};

const collision = (first, second) => {
   if(!(first.x > second.x + second.width
      ||first.x + first.width < second.x
      ||first.y > second.y + second.height
      ||first.y + first.height < second.y)) {
         return true;
   }
}

class Player {
   constructor(id) {
      this.id = id;
      this.speed = 2;
      this.runSpeed = 15;
      this.diagSpeed = this.speed * 0.7;
      this.health = 100;

      this.x = 150;
      this.y = 100;
      this.width = 80;
      this.height = 80;

      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      this.isRunning = false;
   }

   update() {
      if(this.up) this.y -= this.speed;
      if(this.down) this.y += this.speed;
      if(this.left) this.x -= this.speed;
      if(this.right) this.x += this.speed;

      if(this.up && this.left
      ||this.up && this.right
      ||this.down && this.left
      ||this.down && this.right) {
         this.speed = this.diagSpeed;
      }

      if(this.isRunning) this.speed = this.runSpeed;
      // if(!this.isRunning) this.speed = this.runSpeed;
   }
}


// =====================================================================
// Static functions
// =====================================================================
Player.onConnect = (socket) => {
   const player = new Player(socket.id);
   playerList[socket.id] = player;

   socket.on("up", (data) => player.up = data);
   socket.on("down", (data) => player.down = data);
   socket.on("left", (data) => player.left = data);
   socket.on("right", (data) => player.right = data);
   socket.on("running", (data) => player.isRunning = data);
}

Player.OnDisconnect = (socket) => {
   delete playerList[socket.id];
}

Player.updatePosition = () => {
   let pack = [];

   for(let i in playerList) {
      let player = playerList[i];

      for(let j in playerList) {
         let enemy = playerList[j];

         if(enemy !== player && collision(player, enemy)) {
            player.health -= 0.1;
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
   console.log("User connected !");  

   // ==========  Generate ID  ==========
   socket.id = Math.floor(playerMax * Math.random());
   socketList[socket.id] = socket;
   Player.onConnect(socket);   
   

   // ==========  Disconnection  ==========
   socket.on("disconnect", () => {
      console.log("User disconnected !");
      delete socketList[socket.id];
      Player.OnDisconnect(socket);
   });


   // ==========  Chatting  ==========
   socket.on("sendMessage", (data) => {
      const playerName = socket.id;
      for(let i in socketList) {
         socketList[i].emit("addMessage", `${playerName} : ${data}`)
      }
   });

   // ==========  Debugging  ==========
   socket.on("evalServer", (data) => {
      if(!DEBUG) return;
      const response = eval(data);
      socket.emit("evalResponse", response);
   });
});


// =====================================================================
// Sync
// =====================================================================
setInterval(() => {
   let pack = Player.updatePosition();
   
   for(let i in socketList) {
      let socket = socketList[i];
      socket.emit("newPosition", pack);
   }
}, 1000/60);