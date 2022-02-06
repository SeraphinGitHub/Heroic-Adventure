
"use strict"

// Enemy Obj ==> Exemple
// {
//    health: 100,
//    radius: 50,
//    wanderBreakTime: 1500,
//    wanderRange: 200,
//    chasingRange: 400,
//    GcD: 50,
//    hiddenTime: 3000,
//    respawnTime: 10000,
//    damages: 15,
//    damageRatio: 0.5,
//    walkSpeed: 2,
//    runSpeed: 6,
// }

class Enemy {
   constructor(spawnX, spawnY, enemySpecs) {

      this.x = spawnX;
      this.y = spawnY;
      this.spawnX = spawnX;
      this.spawnY = spawnY;
      this.radius = enemySpecs.radius;

      // State Machine
      this.calcX = spawnX;
      this.calcY = spawnY;
      this.wanderBreakTime = enemySpecs.wanderBreakTime;
      this.wanderRange = enemySpecs.wanderRange;
      this.chasingRange = enemySpecs.chasingRange

      // Enemy Health
      this.baseHealth = enemySpecs.health;
      this.health = this.baseHealth;

      // Respawn Time
      this.hiddenTime = enemySpecs.hiddenTime;
      this.respawnTime = enemySpecs.respawnTime;

      // Enemy GcD
      this.baseGcD = enemySpecs.GcD;
      this.GcD = process.env.SYNC_COEFF* this.baseGcD;
      this.speedGcD = this.GcD;

      // Damages
      this.baseDamage = enemySpecs.damages;
      this.calcDamage;
      this.damageRatio = enemySpecs.damageRatio;
      this.attackDelay = enemySpecs.attackDelay;

      // Movements Speed
      this.walkSpeed = Math.round(process.env.SYNC_COEFF* enemySpecs.walkSpeed) /2; // <== WalkSpeed
      this.baseRunSpeed = Math.round(process.env.SYNC_COEFF* enemySpecs.runSpeed) /2; // <== RunSpeed
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
      this.state;
      this.frameX = 0;
      this.frameY = 1;
   }

   RnG(baseSpec, coeff) {
      return Math.floor(baseSpec) + Math.floor(Math.random() * (baseSpec * coeff));
   }

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
}

module.exports = Enemy;