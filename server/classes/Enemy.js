
"use strict"

// Enemy Obj ==> Exemple
// {
//    health: 100,
//    radius: 50,
//    GcD: 50,
//    respawn: 10000,
//    damages: 15,
//    damageRatio: 0.5,
//    walkSpeed: 2,
//    runSpeed: 6,
// }

class Enemy {
   constructor(x, y, enemySpecs) {

      this.x = x;
      this.y = y;
      this.radius = enemySpecs.radius;

      // Enemy Health
      this.baseHealth = enemySpecs.health;
      this.health = this.baseHealth;

      // Respawn Time
      this.respawnTime = enemySpecs.respawn;

      // Enemy GcD
      this.baseGcD = enemySpecs.GcD;
      this.GcD = process.env.SYNC_COEFF* this.baseGcD;
      this.speedGcD = this.GcD;

      // Damages
      this.baseDamage = enemySpecs.damages;
      this.calcDamage;
      this.damageRatio = enemySpecs.damageRatio;

      // Movements Speed
      this.walkSpeed = Math.floor(process.env.SYNC_COEFF* enemySpecs.walkSpeed); // <== WalkSpeed
      this.baseWalkSpeed = this.walkSpeed;
      this.runSpeed = Math.floor(process.env.SYNC_COEFF* enemySpecs.runSpeed); // <== RunSpeed
      this.baseRunSpeed = this.runSpeed;

      // States
      this.isDead = false;
      this.isAttacking = false;

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

   wanderingDir(range) {
      let rng = this.RnG(0, 4);

      // if(this.x !== this.x + range
      // || this.x !== this.x - range
      // || this.y !== this.y + range
      // || this.y !== this.y - range) {
         
      //    if(rng === 0) return this.x += this.walkSpeed;
      //    if(rng === 1) return this.x -= this.walkSpeed;
      //    if(rng === 2) return this.y += this.walkSpeed;
      //    if(rng === 3) return this.y -= this.walkSpeed;
      // }

      if(this.x !== this.x + range && rng === 0) this.x += this.walkSpeed;
      if(this.x !== this.x - range && rng === 1) this.x -= this.walkSpeed;
      if(this.y !== this.y + range && rng === 2) this.y += this.walkSpeed;
      if(this.y !== this.y - range && rng === 3) this.y -= this.walkSpeed;
   }

   death() {
      this.health = 0;
      this.isDead = true;

      setTimeout(() => {
         this.isDead = false;
         this.health = this.baseHealth;

      }, this.respawnTime);

      console.log("Mob is Dead !");
   }

   animation(frame, index, spritesNumber) {
      if(frame % index === 0) {       
         if(this.frameX < spritesNumber) this.frameX++;
         else this.frameX = 0;
      }
   }
}

module.exports = Enemy;