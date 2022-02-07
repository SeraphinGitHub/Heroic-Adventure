
"use strict"

// Enemy Obj ==> Exemple
// {
//    health: 150,
//    radius: 55,
//    wanderRange: 120,
//    wanderBreakTime: 2 *1000,
//    chasingRange: 200,
//    GcD: 60,
//    getFameCost: 100,
//    looseFameCost: 200,
//    hiddenTime: 4 *1000,
//    respawnTime: 1 *1000,
//    damages: 15,
//    attackDelay: 0.5,
//    damageRatio: 0.5,
//    walkSpeed: 3,
//    runSpeed: 6,
//    animArray: minotaursAnim,
// }


class Enemy {
   constructor(spawnX, spawnY, enemySpecs, G_Variables) {

      this.x = spawnX;
      this.y = spawnY;
      this.spawnX = spawnX;
      this.spawnY = spawnY;
      this.radius = enemySpecs.radius;

      // G_Variables
      this.socketList = G_Variables.socketList;
      this.playerList = G_Variables.playerList;
      this.mobList = G_Variables.mobList;
      this.frameRate = G_Variables.frameRate;
      this.syncCoeff = G_Variables.syncCoeff;

      // State Machine
      this.calcX = spawnX;
      this.calcY = spawnY;
      this.wanderBreakTime = enemySpecs.wanderBreakTime;
      this.wanderRange = enemySpecs.wanderRange;
      this.chasingRange = enemySpecs.chasingRange

      // Health
      this.baseHealth = enemySpecs.health;
      this.health = this.baseHealth;

      // Respawn Time
      this.hiddenTime = enemySpecs.hiddenTime;
      this.respawnTime = enemySpecs.respawnTime;

      // GcD
      this.baseGcD = enemySpecs.GcD;
      this.GcD = this.syncCoeff * this.baseGcD;
      this.speedGcD = this.GcD;

      // Damages
      this.baseDamage = enemySpecs.damages;
      this.calcDamage;
      this.damageRatio = enemySpecs.damageRatio;
      this.attackDelay = enemySpecs.attackDelay;

      // FameCost
      this.getFameCost = enemySpecs.getFameCost;
      this.looseFameCost = enemySpecs.looseFameCost;

      // Movements Speed
      this.walkSpeed = Math.round(this.syncCoeff * enemySpecs.walkSpeed) /2; // <== WalkSpeed
      this.baseRunSpeed = Math.round(this.syncCoeff * enemySpecs.runSpeed) /2; // <== RunSpeed
      this.runSpeed = this.baseRunSpeed;

      // States
      this.isDead = false;
      this.isHidden = false;
      this.isWandering = true;
      this.isChasing = true;
      this.isAttacking = false;
      this.isCalcPos = false;
      this.isReCalc = false;

      // Anim States
      this.attack_isAnimable = false;

      // Animation
      this.animArray = enemySpecs.animArray;
      this.state;
      this.frameX = 0;
      this.frameY = 1;
   }

   RnG = (baseSpec, coeff) => {
      return Math.floor(baseSpec) + Math.floor(Math.random() * (baseSpec * coeff));
   }

   damageRnG() {
      return this.RnG(this.baseDamage, this.damageRatio); // More high => Higher RnG Range => More damage (0 ~ 1)
   }

   circle_toCircle = (first, second, offsetX, offsetY, radius) => {
      let dx = second.x - (first.x + offsetX);
      let dy = second.y - (first.y + offsetY);
      let distance = Math.sqrt(dx * dx + dy * dy);
      let sumRadius = radius + second.radius;
   
      if(distance <= sumRadius) return true;
   }

   calcPosition() {

      // Calculate random position (Run once)
      if(!this.isCalcPos) {
         this.isCalcPos = true;
         
         let RnG_Distance = this.RnG(1, this.wanderRange);
         let RnG_Degrees = this.RnG(1, 360);
         let RnG_Radians = RnG_Degrees * Math.PI / 180;
         
         this.calcX = this.spawnX + (RnG_Distance * Math.cos(RnG_Radians));
         this.calcY = this.spawnY + (RnG_Distance * Math.sin(RnG_Radians));
      }
   }

   moveToPosition(x, y, speed) {

      this.calcX = Math.round(x);
      this.calcY = Math.round(y);
      
      // Reach calculated position (Every Frame)
      if(this.calcX > this.x) {
         this.x += speed;
         if(this.x + speed > this.calcX) this.x = this.calcX;
      }

      if(this.calcX < this.x) {
         this.x -= speed;
         if(this.x - speed < this.calcX) this.x = this.calcX;
      }

      if(this.calcY > this.y) {
         this.y += speed;
         if(this.y + speed > this.calcY) this.y = this.calcY;
      }

      if(this.calcY < this.y) {
         this.y -= speed;
         if(this.y - speed < this.calcY) this.y = this.calcY;
      }
   }

   wandering() {
      if(this.isWandering) {

         this.calcPosition();
         this.moveToPosition(this.calcX, this.calcY, this.walkSpeed);
   
         // Stop && Renewal calculation (Run once)
         if(this.calcX === this.x && this.calcY === this.y && !this.isReCalc) {
            this.isReCalc = true;
            this.frameX = 0;
            
            setTimeout(() => {
               this.isReCalc = false;
               this.isCalcPos = false
            }, this.wanderBreakTime);
         }
      }
   }

   chasing(player) {

      this.isWandering = false;
      this.isChasing = true;
      this.isAttacking = false;
      this.runSpeed = this.baseRunSpeed;

      this.moveToPosition(player.x, player.y, this.runSpeed);
   }

   attacking() {
      this.isWandering = false;
      this.isChasing = false;
      this.isAttacking = true;
      this.runSpeed = 0;
   }

   backToSpawn() {
      if(this.isChasing) {

         this.isWandering = true;
         this.isChasing = false;
         this.isAttacking = false;

         this.isCalcPos = false;
         this.calcPosition();
      }
   }
   
   movements() {
      // For 2 Directions Sprites Sheets

      // Cross Move
      if(this.y > this.calcY || this.x > this.calcX) this.frameY = 0; // Left
      if(this.y < this.calcY || this.x < this.calcX) this.frameY = 1; // Right

      // Diag Move
      if(this.y > this.calcY && this.x > this.calcX
      || this.y < this.calcY && this.x > this.calcX) this.frameY = 0; // Top / Down Left
      if(this.y > this.calcY && this.x < this.calcX
      || this.y < this.calcY && this.x < this.calcX) this.frameY = 1; // Top / Down Right
   }
   
   calcGcD() {
      
      // Regen GcD
      if(this.speedGcD < this.GcD) {
         this.speedGcD += this.syncCoeff *1;
         if(this.isAttacking) this.isAttacking = false;
      }
      
      // GcD Up
      if(this.speedGcD >= this.GcD) this.attack();
   }
   
   attack() {
      if(this.isAttacking && !this.attack_isAnimable) {
         
         this.frameX = 0;
         this.speedGcD = 0;
         this.isAttacking = false;
         this.attack_isAnimable = true;
         
         setTimeout(() => this.attack_isAnimable = false, this.animTimeOut());
         this.damagingPlayers();
      }
   }
   
   damagingPlayers() {
      
      for(let i in this.playerList) {
         
         let player = this.playerList[i];
         let socket = this.socketList[player.id];
         
         const playerPos = {
            x: player.x,
            y: player.y,
         };

         if(!player.isDead
         && this.circle_toCircle(this, player, 0, 0, this.radius)) {

            // Delay logic to match animation
            setTimeout(() => {

               player.calcDamage = this.damageRnG();
               player.health -= player.calcDamage;
               socket.emit("getDamage", playerPos, player.calcDamage);

               // Player's Death
               if(player.health <= 0) {
                  
                  this.isChasing = true;
                  this.runSpeed = this.baseRunSpeed;
                  player.death(socket, this.looseFameCost);
            
                  // Player Score
                  socket.emit("playerScore", {
                     kills: player.kills,
                     died: player.died,
                     fame: player.fame,
                     fameCount: player.fameCount,
                  });
            
                  // Toggle Fame Text
                  socket.emit("looseFame", playerPos, this.looseFameCost);
               }
            }, this.animTimeOut() * this.attackDelay);
         }
      }
   }
   
   sateMachine() {
      
      for(let i in this.playerList) {
         let player = this.playerList[i];

         // if player enter chasing range
         if(this.circle_toCircle(this, player, 0, 0, this.chasingRange) && !player.isDead) {

            // if enemy collide with player
            if(this.circle_toCircle(this, player, 0, 0, this.radius)) this.attacking();
            else this.chasing(player);
         }
         
         else this.backToSpawn();
      }

      this.wandering();
   }

   death() {
      this.health = 0;
      this.isDead = true;
      this.isChasing = true;
      
      this.runSpeed = this.baseRunSpeed;
      this.backToSpawn();
      
      setTimeout(() => {
         this.isHidden = true
         
         setTimeout(() => {
            this.isDead = false;
            this.isHidden = false;
            this.health = this.baseHealth;
            
            this.x = this.spawnX;
            this.y = this.spawnY;
   
         }, this.respawnTime);
      }, this.hiddenTime);
   }

   animation(frame, index, spritesNumber) {
      if(frame % index === 0) {       
         if(this.frameX < spritesNumber) this.frameX++;
         else if(!this.isDead) this.frameX = 0;
      }
   }

   animTimeOut() {
      
      if(!this.isDead) return Math.round(
         
         this.frameRate *
         this.syncCoeff *
         this.animArray.attack.index *
         this.animArray.attack.spritesNumber / 4
      );
   }

   // Animation State
   animState(frame) {
      
      if(!this.isDead) {

         // Attack State
         if(this.attack_isAnimable) {
            this.animation(frame, this.animArray.attack.index, this.animArray.attack.spritesNumber);
            return this.state = "attack";
         }

         // Idle State
         if((this.x === this.calcX && this.y === this.calcY) || this.runSpeed === 0) {
            this.animation(frame, this.animArray.idle.index, this.animArray.idle.spritesNumber);
            return this.state = "idle";
         }
      
         // Walk State
         else {
            this.animation(frame, this.animArray.walk.index, this.animArray.walk.spritesNumber);
            return this.state = "walk";
         }
      }

      else {
         this.animation(frame, this.animArray.died.index, this.animArray.died.spritesNumber);
         this.state = "died";
      }
   }

   // Update (Sync)
   update(frame) {

      if(!this.isDead) {

         this.calcGcD();
         this.movements();
         this.sateMachine();
      }
      
      this.animState(frame);
      return this;
   }
}

module.exports = Enemy;