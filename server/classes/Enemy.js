
"use strict"

// Import Class inheritance
const Character = require("./Character.js");

class Enemy extends Character {
   constructor(spawnX, spawnY, enemySpecs) {

      super();

      this.id;      
      this.x = spawnX;
      this.y = spawnY;
      this.spawnX = spawnX;
      this.spawnY = spawnY;
      this.name = enemySpecs.name;
      this.radius = enemySpecs.radius;

      // Env Variables
      this.devFPS = process.env.DEV_FRAME_RATE;
      this.deployFPS = process.env.DEPLOY_FRAME_RATE;
      this.syncCoeff = process.env.SYNC_COEFF;
      this.syncFormula = Math.floor(this.syncCoeff *this.devFPS /this.deployFPS *10) /10;

      // State Machine
      this.calcX = spawnX;
      this.calcY = spawnY;
      this.wanderBreakTime = enemySpecs.wanderBreakTime;
      this.wanderRange = enemySpecs.wanderRange;
      this.baseChasingRange = enemySpecs.chasingRange;
      this.chasingRange = this.baseChasingRange;
      this.maxChaseRange = this.wanderRange * 4;

      // Health
      this.baseHealth = enemySpecs.health;
      this.health = this.baseHealth;

      // Respawn Time
      this.hiddenTime = enemySpecs.hiddenTime;
      this.respawnTime = enemySpecs.respawnTime;

      // GcD
      this.baseGcD = enemySpecs.GcD;
      this.GcD = Math.floor(this.baseGcD *this.syncCoeff); // More high ==> more slow
      this.speedGcD = this.GcD;

      // Damages
      this.baseDamage = enemySpecs.damages;
      this.calcDamage;
      this.damageRatio = enemySpecs.damageRatio;

      // FameCost
      this.getFameCost = enemySpecs.getFameCost;
      this.looseFameCost = enemySpecs.looseFameCost;

      // Movements Speed
      this.walkSpeed = Math.round(enemySpecs.walkSpeed *this.syncFormula) /2;
      this.runSpeed = Math.round(enemySpecs.runSpeed *this.syncFormula) /2;
      this.speed;

      // States
      this.isDead = false;
      this.isHidden = false;
      this.isWandering = true;
      this.isChasing = false;
      this.isAttacking = false;
      this.isCalcPos = false;
      this.isReCalc = false;

      // Anim States
      this.attack_isAnimable = false;

      // Animation
      this.state;
      this.frameY = 1;
      this.animationDelay = enemySpecs.animationDelay;
      this.imageSrc = enemySpecs.imageSrc;
      this.animSpecs = enemySpecs.animSpecs;
      this.sprites = enemySpecs.sprites;
   }
   
   // Calc Rng
   damageRnG() {
      return this.RnG(this.baseDamage, this.damageRatio); // More high => Higher RnG Range => More damage (0 ~ 1)
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

   moveToPosition(x, y) {

      this.calcX = Math.round(x);
      this.calcY = Math.round(y);

      if(this.calcX > this.x) {
         this.x += this.speed;
         if(this.x + this.speed > this.calcX) this.x = this.calcX;
      }

      if(this.calcX < this.x) {
         this.x -= this.speed;
         if(this.x - this.speed < this.calcX) this.x = this.calcX;
      }

      if(this.calcY > this.y) {
         this.y += this.speed;
         if(this.y + this.speed > this.calcY) this.y = this.calcY;
      }

      if(this.calcY < this.y) {
         this.y -= this.speed;
         if(this.y - this.speed < this.calcY) this.y = this.calcY;
      }
   }
   
   // Calc Aggro
   calcAggroPlayers(player, aggroArray) {

      let distance = this.calcDistance(this.x, this.y, player.x, player.y);

      aggroArray.push({
         id: player.id,
         dist: distance
      });
   }

   calcNearestPlayer(aggroArray) {

      aggroArray.sort((first, second) => { return first.dist - second.dist });
      return aggroArray[0];
   }

   // Movements
   movements() {
      // For 2 Directions Sprites Sheets

      // Cross Move
      if(this.y > this.calcY || this.x > this.calcX) this.frameX = 1; // Left
      if(this.y < this.calcY || this.x < this.calcX) this.frameX = 0; // Right

      // Diag Move
      if(this.y > this.calcY && this.x > this.calcX
      || this.y < this.calcY && this.x > this.calcX) this.frameX = 1; // Top / Down Left
      if(this.y > this.calcY && this.x < this.calcX
      || this.y < this.calcY && this.x < this.calcX) this.frameX = 0; // Top / Down Right
   }

   // GcD
   calcGcD() {
      
      // Regen GcD
      if(this.speedGcD < this.GcD) {
         this.speedGcD = Math.floor(this.speedGcD + this.syncFormula);
         if(this.isAttacking) this.isAttacking = false;
      }      
   }   

   // Enemy States
   wandering() {
      if(this.isWandering) {

         this.speed = this.walkSpeed;
         this.calcPosition();
         this.moveToPosition(this.calcX, this.calcY);
   
         // Stop && Renewal calculation (Run once)
         if(this.calcX === this.x && this.calcY === this.y && !this.isReCalc) {
            this.isReCalc = true;
            
            setTimeout(() => {
               this.isReCalc = false;
               this.isCalcPos = false
            }, this.wanderBreakTime);
         }
      }
   }

   chasing(player) {
      if(!this.isChasing) {

         this.isWandering = false;
         this.isAttacking = false;
         this.speed = this.runSpeed;
         this.moveToPosition(player.x, player.y);
   
         let distance = this.calcDistance(this.spawnX, this.spawnY, this.x, this.y);
         
         if(distance >= this.maxChaseRange) {
            this.isChasing = true;
            this.backToSpawn(player);
         }
      }
   }

   attacking(socket, player) {

      if(!this.isAttacking
      && !this.attack_isAnimable
      && this.speedGcD >= this.GcD) {

         this.isWandering = false;
         this.isChasing = false;
         this.isAttacking = true;
         this.attack_isAnimable = true;
         
         this.speed = 0;
         this.speedGcD = 0;
         this.damagingPlayers(socket, player);
      }
   }
   
   damagingPlayers(socket, player) {

      if(!player.isDead) {
         const animTimeOut = this.animTimeOut(this.animSpecs.attack.index, this.animSpecs.attack.spritesNumber);

         // Delay the logic to match animation
         setTimeout(() => player.getDamage(this, socket), animTimeOut *this.animationDelay);
         setTimeout(() => this.attack_isAnimable = false, animTimeOut);
      }
   }

   getDamage(enemy, killetSocket) {

      this.calcDamage = enemy.damageRnG();
      this.health -= this.calcDamage;
      
      const mobPos = {
         x: this.x,
         y: this.y,
      };
      
      killetSocket.emit("giveDamage", mobPos, this.calcDamage);

      // Mob's Death
      if(this.health <= 0) {
         
         this.death(enemy);
         enemy.totalFameCost += this.getFameCost;
      }
   }

   backToSpawn(player) {
      
      this.chasingRange = 0;
      this.isAttacking = false;
      this.speed = this.runSpeed;
      this.moveToPosition(this.spawnX, this.spawnY);
      
      if(this.x === this.spawnX && this.y === this.spawnY) {

         if(this.health !== this.baseHealth) this.health = this.baseHealth;
         
         this.isWandering = true;
         this.isChasing = false;
         this.chasingRange = this.baseChasingRange;

         if(player.chased_By.includes(this.id)) this.removeIndex(player.chased_By, this.id);
      }
   }
   
   // State Machine
   sateMachine(socketList, playerList) {
      let aggroArray = [];
      
      // ===========================================
      // Chasing ==> Players enter Chasing range
      // ===========================================
      for(let i in playerList) {
         let player = playerList[i];

         if(this.circle_toCircle(this, player, 0, 0, this.chasingRange) && !player.isDead) {
            this.calcAggroPlayers(player, aggroArray);
            if(!player.chased_By.includes(this.id)) player.chased_By.push(this.id);
         }
         else if(player.chased_By.includes(this.id)) this.backToSpawn(player);
      }
      let nearestPlayer = this.calcNearestPlayer(aggroArray);

      
      // ===========================================
      // Attacking ==> Players collide with enemy
      // ===========================================
      if(nearestPlayer !== undefined) {
         for(let i in playerList) {
           
            let player = playerList[i];
            let socket = socketList[player.id];

            if(nearestPlayer.id === player.id) {
               if(this.circle_toCircle(this, player, 0, 0, this.radius)) {
                  this.attacking(socket, player);
               }
               else this.chasing(player);
            }
         }
      }
      
      this.wandering();
   }

   // Death
   death(player) {
      this.health = 0;
      this.isDead = true;
      this.isChasing = true;
      
      this.speed = this.runSpeed;
      this.backToSpawn(player);
      
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

   // Animation State
   animState() {
      
      if(!this.isDead) {

         // Attack State
         if(this.attack_isAnimable) return this.state = "attack";

         // Idle State
         if((this.x === this.calcX && this.y === this.calcY) || this.speed === 0) return this.state = "idle";
      
         // Run State
         if(this.speed === this.runSpeed) return this.state = "run";

         // Walk State
         else return this.state = "walk";
      }

      else this.state = "died";
   }

   // Update (Sync)
   update(frame, socketList, playerList, lightPack_MobList) {

      this.animState(frame);
      
      if(!this.isDead) {

         this.movements();
         this.calcGcD();
         this.sateMachine(socketList, playerList);
      }

      lightPack_MobList.push( this.lightPack() );
   }

   initPack() {
      return {
         id: this.id,
         spawnX: this.spawnX,
         spawnY: this.spawnY,
         name: this.name,
         radius: this.radius,
         wanderRange: this.wanderRange,
         maxChaseRange: this.maxChaseRange,
         baseHealth: this.health,
         imageSrc: this.imageSrc,
         animSpecs: this.animSpecs,
         sprites: this.sprites,
      }
   }

   lightPack() {
      return {
         id: this.id,
         x: this.x,
         y: this.y,
         radius: this.radius,
         calcX: this.calcX,
         calcY: this.calcY,
         health: this.health,
         // chasingRange: this.chasingRange,  // <== DEBUG Only
         isDead: this.isDead,
         isHidden: this.isHidden,
         state: this.state,
         frameX: this.frameX
      }
   }
}

module.exports = Enemy;