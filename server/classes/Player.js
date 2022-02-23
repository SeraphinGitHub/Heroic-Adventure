
"use strict"

// Import Class inheritance 
const Character = require("./Character.js");

class Player extends Character {
   constructor(id) {
      
      super();
      
      this.id = id;
      this.name = "";
      this.x = 1080;
      this.y = 800;

      // Viewport size in CSS & JS +200 for both
      this.detectViewport = {
         height: 1000,
         width: 1400,
      }
      
      // Env Variables
      this.devFPS = process.env.DEV_FRAME_RATE;
      this.deployFPS = process.env.DEPLOY_FRAME_RATE;
      this.syncCoeff = process.env.SYNC_COEFF;
      this.syncFormula = this.syncCoeff *this.devFPS /this.deployFPS;

      // Player Hitbox
      this.radius = 42;

      // Attack Hitbox
      this.attkOffset_X = 0;
      this.attkOffset_Y = 45;
      this.attkRadius = 32;
      
      // GcD
      this.baseGcD = 30;
      this.GcD = Math.floor(this.baseGcD *this.syncCoeff); // More high ==> more slow
      this.speedGcD = this.GcD;

      // Player Health
      this.baseHealth = 250;
      this.health = this.baseHealth;

      // Player Energy
      this.baseEnergy = 200;
      this.energy = this.baseEnergy;
      this.energyCost = 0.7;
      this.baseRegenEnergy = 0.15;
      this.regenEnergy = Math.floor(this.baseRegenEnergy *this.syncCoeff *100) /100;

      // Player Mana
      this.baseMana = 150;
      this.mana = this.baseMana;
      this.baseRegenMana = 0.12;
      this.regenMana = Math.floor(this.baseRegenMana *this.syncCoeff *100) /100;

      // Fame
      // this.getFameCost = 500;
      // this.looseFameCost = 300;

      this.getFameCost = 2000;
      this.looseFameCost = 2000;

      this.baseFame = 10000;
      this.fame = 8000;
      this.fameValue = this.fame;
      this.fameCount = 0;
      this.totalFameCost = 0;

      // Death
      this.baseRespawnTimer = 1; //<== seconds
      // this.baseRespawnTimer = 10; //<== seconds
      this.respawnTimer = this.baseRespawnTimer;
      this.deathCounts = 0;

      // Damages
      this.baseDamage = 23;
      this.calcDamage;

      // Spells cast
      this.cast_Heal = false;
      
      // Spell - Healing
      this.healCost = 45;
      this.baseHealing = this.baseHealth * 0.15; // <== Healing = 25% from MaxHealth
      this.calcHealing;
      
      // Movements Speed
      this.walkSpeed = Math.floor( 3 *this.syncFormula);
      this.runSpeed = Math.floor( 7 *this.syncFormula);
      this.baseWalkSpeed = this.walkSpeed;
      this.baseRunSpeed = this.runSpeed;
      
      // Movements Axis
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      // States
      this.isDead = false;
      this.isRespawning = false;
      this.isCasting = false;
      this.isRunning = false;
      this.isRunnable = false;
      this.isAttacking = false;
      this.isCtxPlayer = true;

      // Enemies ID Array
      this.chased_By = [];

      // Anim States
      this.attack_isAnimable = false;
      this.heal_isAnimable = false;

      // Score
      this.kills = 0;
      this.died = 0;

      // Fluidity
      this.fluidSpeed = 20;

      // Animation
      this.state;
      this.frameX = 1;
      this.animSpecs = {
         idle: {
            index: 2,
            spritesNumber: 30,
         },
      
         walk: {
            index: 1,
            spritesNumber: 30,
         },
      
         run: {
            index: 1,
            spritesNumber: 15,
         },
      
         attack: {
            index: 1,
            spritesNumber: 15,
         },
      
         heal: {
            index: 2,
            spritesNumber: 15,
         },
      
         died: {
            index: 3,
            spritesNumber: 30,
         },
      }

      // Player Sprites
      this.sprites = {
         height: 200,
         width: 200,
         offsetY: 5,
         radius: 45,
      }
   }

   DEBUG_PlayerPosition() {

      console.log("*************** attacking() method *****");
      console.log({ x: this.x });
      console.log({ y: this.y });
   }

   // Calc Rng
   healRnG() {
      return this.RnG(this.baseHealing, 0.57); // More high => Higher RnG Range => More heal
   }

   damageRnG() {
      return this.RnG(this.baseDamage, 0.62); // More high => Higher RnG Range => More damage
   }

   // Movements
   movements() {

      let moveSpeed = this.walkSpeed;
      if(this.isRunning && this.isRunnable) moveSpeed = this.runSpeed;
   
      // Map Border Reached ==> Temporary (Await for Unwalkable Tiles)
      if(this.up && this.y < -15
      || this.down && this.y > 1550
      || this.left && this.x < 45
      || this.right && this.x > 2120) {
         return;
      }
   
      const axisOffset = {
         yAxis_x: 0,
         yAxis_y: 45,
         xAxis_x: 30,
         xAxis_y: 10,
      }
      
      this.crossMove(moveSpeed, axisOffset);
      this.diagMove(moveSpeed, axisOffset);
   }
   
   crossMove(moveSpeed, axisOffset) {
   
      // Up & Down or Left & Right at the Same Time
      if(this.up && this.down || this.left && this.right) {

         this.frameX = 1;
         this.attkOffset_X = axisOffset.yAxis_x;
         this.attkOffset_Y = axisOffset.yAxis_y;
      }
   
      else {
         // Up (yAxis)
         if(this.up) {

            this.frameX = 0;
            this.y -= moveSpeed;
            this.attkOffset_X = axisOffset.yAxis_x;
            this.attkOffset_Y = -axisOffset.yAxis_y;
         }
         
         // Down (yAxis)
         if(this.down) {

            this.frameX = 1;
            this.y += moveSpeed;
            this.attkOffset_X = axisOffset.yAxis_x;
            this.attkOffset_Y = axisOffset.yAxis_y;
         }
         
         // Left (xAxis)
         if(this.left) {

            this.frameX = 2;
            this.x -= moveSpeed;
            this.attkOffset_X = -axisOffset.xAxis_x;
            this.attkOffset_Y = axisOffset.xAxis_y;
         }
         
         // Right (xAxis)
         if(this.right) {  

            this.frameX = 3;
            this.x += moveSpeed;
            this.attkOffset_X = axisOffset.xAxis_x;
            this.attkOffset_Y = axisOffset.xAxis_y;
         }
      }
   }
   
   diagMove(moveSpeed, axisOffset) {
      
      // Attack circle position
      let offset = ((axisOffset.yAxis_y + axisOffset.xAxis_x) / 2) * 0.7;
   
      // Up & Left
      if(this.up && this.left) {

         this.frameX = 0;
         this.attkOffset_X = -offset;
         this.attkOffset_Y = -offset; 
      }
   
      // Up & Right
      if(this.up && this.right) {

         this.frameX = 0;
         this.attkOffset_X = offset;
         this.attkOffset_Y = -offset;
      }
   
      // Down & Left
      if(this.down && this.left) {

         this.frameX = 1;
         this.attkOffset_X = -offset;
         this.attkOffset_Y = offset;
      }
   
      // Down & Right
      if(this.down && this.right) {

         this.frameX = 1;
         this.attkOffset_X = offset;
         this.attkOffset_Y = offset;
      }
   
      
      // Fix diag Speed
      if(this.up && this.left
      ||this.up && this.right
      ||this.down && this.left
      ||this.down && this.right) {
         moveSpeed = Math.sqrt(moveSpeed);
      }
   }

   running() {

      if(this.energy < this.baseEnergy) this.energy = Math.floor((this.energy + this.regenEnergy) *100) /100;
      if(this.energy >= this.baseEnergy) this.energy = this.baseEnergy;
      
      if(this.isRunning && this.isRunnable) {
         
         this.energy = Math.floor(this.energy -this.energyCost);
         if(this.energy <= 0) this.energy = 0;
         if(this.energy < this.energyCost) this.isRunnable = false;
      }
   
      if(!this.isRunning) this.isRunnable = true;
   }

   // GcD / Attack / Cast
   calcGcD() {
   
      // Regen Mana
      if(this.mana < this.baseMana) this.mana = Math.floor((this.mana + this.regenMana) *100) /100;
      
      // Regen GcD
      if(this.speedGcD < this.GcD) {
         this.speedGcD = Math.floor(this.speedGcD + this.syncFormula);
         if(this.isAttacking) this.isAttacking = false;
      }  
   }
   
   attacking(socketList, playerList, mobList) {
   
      // Player Attack
      if(this.isAttacking
      && !this.attack_isAnimable
      && this.speedGcD >= this.GcD) {

         // ***************************
         // this.DEBUG_PlayerPosition();
         // ***************************
         
         this.speedGcD = 0;
         this.isAttacking = false;
         this.attack_isAnimable = true;
         
         setTimeout(() => {
            this.attack_isAnimable = false;
         }, this.animTimeOut(this.animSpecs.attack.index, this.animSpecs.attack.spritesNumber));
         
         let socket = socketList[this.id];
         this.damagingOtherPlayers(socket, socketList, playerList);
         this.damagingMobs(socketList, mobList);

         this.calcfame("get", this.totalFameCost, socket);
         
         const playerPos = {
            id: this.id,
            x: this.x,
            y: this.y,
         };

         const serverFame = {
            baseFame: this.baseFame,
            fameValue: this.fameValue,
            totalFameCost: this.totalFameCost,
            fluidSpeed: this.fluidSpeed,
         }

         if(this.totalFameCost !== 0) {
            socket.emit("getFame", playerPos, serverFame);
            this.totalFameCost = 0;
         }
      }
   }
   
   casting(socketList) {
      
      if(this.isCasting && this.speedGcD >= this.GcD) {
         
         this.isCasting = false;
         this.healing(socketList);
      }
   }
   
   healing(socketList) {
      
      if(this.cast_Heal
      && this.mana >= this.healCost
      && this.health < this.baseHealth) {

         let socket = socketList[this.id];

         this.speedGcD = 0;
         this.cast_Heal = false;
         this.heal_isAnimable = true;
         
         setTimeout(() => {
            this.heal_isAnimable = false
         }, this.animTimeOut(this.animSpecs.heal.index, this.animSpecs.heal.spritesNumber));
   
         this.calcHealing = this.healRnG();
         this.health += this.calcHealing;
         this.mana -= this.healCost;
   
         if(this.health > this.baseHealth) this.health = this.baseHealth;
   
         socket.emit("getHeal", {
            id: this.id,
            x: this.x,
            y: this.y,
            calcHealing: this.calcHealing,
         });
      }
   }
   
   // Damaging
   damagingOtherPlayers(socket, socketList, playerList) {

      for(let i in playerList) {
         let otherPlayer = playerList[i];
         let otherSocket = socketList[otherPlayer.id];
   
         if(this.circle_toCircle(this, otherPlayer, this.attkOffset_X, this.attkOffset_Y, this.attkRadius)) {
   
            if(this !== otherPlayer
            && !otherPlayer.isDead) {
               
               otherPlayer.calcDamage = this.damageRnG();
               otherPlayer.health -= otherPlayer.calcDamage;
   
               const otherPlayerPos = {
                  id: otherPlayer.id,
                  x: otherPlayer.x,
                  y: otherPlayer.y,
               };
               
               socket.emit("giveDamage", otherPlayerPos, otherPlayer.calcDamage);
               otherSocket.emit("getDamage", otherPlayerPos, otherPlayer.calcDamage);
   
               // Other player's Death
               if(otherPlayer.health <= 0) {

                  this.kills++;
                  this.totalFameCost += this.getFameCost;
                  
                  const otherFame = {
                     baseFame: otherPlayer.baseFame,
                     fameValue: otherPlayer.fameValue,
                     fameCost: this.looseFameCost,
                     fluidSpeed: otherPlayer.fluidSpeed,
                  }
                  
                  if(otherPlayer.fame >= this.looseFameCost) otherSocket.emit("looseFame", otherPlayerPos, otherFame);
                  otherPlayer.death();
                  otherPlayer.calcfame("loose", this.looseFameCost, otherSocket);
               }
            }
         }
      }
   }
   
   damagingMobs(socketList, mobList) {
   
      let socket = socketList[this.id];
      
      mobList.forEach(mob => {
   
         if(!mob.isDead
         && this.circle_toCircle(this, mob, this.attkOffset_X, this.attkOffset_Y, this.attkRadius)) {
            
            mob.calcDamage = this.damageRnG();
            mob.health -= mob.calcDamage;
            
            const mobPos = {
               x: mob.x,
               y: mob.y,
            };
            
            socket.emit("giveDamage", mobPos, mob.calcDamage);
   
            // Mob's Death
            if(mob.health <= 0) {

               mob.death();
               this.totalFameCost += mob.getFameCost;
            }
         }
      });
   }
   
   // Fame
   calcfame(stateStr, fameCost, socket) {
      
      // Get Fame / Famecount +
      if(stateStr === "get") {
         
         let delayedFameValue = this.fameValue;
         delayedFameValue += fameCost;
         
         this.fame += fameCost;
         
         if(this.fame /this.baseFame >= 1) {
            
            this.fameCount += Math.floor(delayedFameValue /this.baseFame);
            delayedFameValue = this.fame - (this.baseFame *this.fameCount);
            socket.emit("fameCount", this.fameCount);
         }

         const latency = 50;
         const clientFrameRate = 1000/60;
         const animTimeOut = Math.floor((clientFrameRate *fameCost /this.fluidSpeed) -latency);

         setTimeout(() => this.fameValue = delayedFameValue, animTimeOut);
      }

      // Loose Fame / FameCount -
      if(stateStr === "loose") {
         
         this.fame -= fameCost;

         if(this.fameValue < fameCost) this.fameValue = this.baseFame - (fameCost -this.fameValue);
         else this.fameValue -= fameCost;
         
         if(this.fame <= 0) this.fame = 0;
         if(this.fameValue <= 0) this.fameValue = 0;

         // if(this.fameValue <= 0 && this.fameCount >= 1) this.fameValue = 100;
         // if(this.fameValue < fameCost) this.fameValue = 100;



         if(this.fame /this.baseFame < 1) {

            this.fameValue = this.fame;
            this.fameCount -= Math.ceil(this.fameValue /this.baseFame);            
            socket.emit("fameCount", this.fameCount);
         }
      }

      socket.emit("playerScore", {
         kills: this.kills,
         died: this.died,
         fame: this.fame,
         fameCount: this.fameCount,
      });
   }

   // Death
   death() {

      const respawnRange = 600;
      
      if(!this.isDead) {
         this.isDead = true;
         
         this.health = 0;
         this.died++;
         this.deathCounts++;

         if(this.deathCounts === 10) this.deathCounts = 0;
      }
      
      const respawnCooldown = setInterval(() => {
         this.respawnTimer --;
         
         if(this.respawnTimer <= 0) {

            this.isDead = false;
            this.isRespawning = true;
            this.hasLostFame = false;

            // Reset Player Bars
            this.health = this.baseHealth;
            this.mana = this.baseMana;
            this.energy = this.baseEnergy;
            this.speedGcD = this.GcD;

            // Reset Respawn Timer
            this.respawnTimer = this.baseRespawnTimer;
            this.color = "darkviolet"; // <== Debug Mode
            
            // Randomize position on respawn
            this.x = (this.x -respawnRange/2) + Math.round(Math.random() * respawnRange);
            this.y = (this.y -respawnRange/2) + Math.round(Math.random() * respawnRange);

            clearInterval(respawnCooldown);
         }
      }, 1000);
   }

   // Death Screen Event
   deathScreen(socket) {

      if(this.isDead && !this.isRespawning) {
         
         socket.emit("playerScore", {
            kills: this.kills,
            died: this.died,
            fame: this.fame,
            fameCount: this.fameCount,
         });

         socket.emit("playerDeath", {
            respawnTimer: this.respawnTimer,
            deathCounts: this.deathCounts
         });
      }

      else if(!this.isDead && this.isRespawning) {
         this.isRespawning = false;
         socket.emit("playerRespawn");
      }
   }
   
   // Animation State
   animState = () => {
      
      // Attack State
      if(this.attack_isAnimable) return this.state = "attack";
   
      // Heal State
      if(this.heal_isAnimable) return this.state = "heal";
      
      // Moving State
      if(this.up || this.down || this.left || this.right) {
   
         if(this.up && this.down || this.left && this.right) return this.state = "idle";
   
         // Run State
         else if(this.isRunning && this.isRunnable) return this.state = "run";
   
         // Walk State
         else return this.state = "walk";
      }
   
      // Idle State
      else return this.state = "idle";
   }

   sortingLayer(playerList, mobList) {

      mobList.forEach(mob => {
         if(this.circle_toCircle(this, mob, 0, 0, mob.radius)) {
            
            if(this.y > mob.y) this.isCtxPlayer = true;
            else this.isCtxPlayer = false;
         }
      });

      for(let i in playerList) {
         let otherPlayer = playerList[i];

         if(this !== otherPlayer) {
            if(this.circle_toCircle(this, otherPlayer, 0, 0, otherPlayer.radius)) {
               
               if(this.y > otherPlayer.y) this.isCtxPlayer = true;
               else this.isCtxPlayer = false;
            }
         }
      };
   }

   // Update (Sync)
   update(socketList, playerList, mobList, lightPack_PlayerList) {

      if(!this.isDead) {

         this.movements();
         this.running();
         this.calcGcD();
         this.attacking(socketList, playerList, mobList);
         this.casting(socketList);
         this.animState();
         this.sortingLayer(playerList, mobList);

      }
      else this.state = "died";

      lightPack_PlayerList[this.id] = this.lightPack();
   }

   initPack() {
      return {
         name: this.name,
         radius: this.radius,
         detectViewport: this.detectViewport,
         attkRadius: this.attkRadius,
         healCost: this.healCost,
         GcD: this.GcD,
         baseHealth: this.baseHealth,
         baseEnergy: this.baseEnergy,
         baseMana: this.baseMana,
         baseFame: this.baseFame,
         animSpecs: this.animSpecs,
         sprites: this.sprites
      }
   }

   lightPack() {
      return {
         id: this.id,
         x: this.x,
         y: this.y,
         attkOffset_X: this.attkOffset_X,
         attkOffset_Y: this.attkOffset_Y,
         speedGcD: this.speedGcD,
         health: this.health,
         energy: this.energy,
         mana: this.mana,
         fame: this.fame,
         fameValue: this.fameValue,
         isCtxPlayer: this.isCtxPlayer,
         state: this.state,
         frameX: this.frameX
      }
   }
}

module.exports = Player;