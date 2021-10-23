
"use strict"

class Player {
   constructor(id) {
      this.id = id;

      this.walkSpeed = 7;
      this.runSpeed = 15;
      this.health = 200;
      this.damageMin = 15;
      this.damageMax = 20;
      this.displayDamage = "";

      this.x = 200;
      this.y = 200;
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
   
   randomize(factor) {
      return Math.floor(Math.random() * factor);
   }

   update() {
      let moveSpeed;
      if(!this.isRunning) moveSpeed = this.walkSpeed;
      else moveSpeed = this.runSpeed;

      if(this.up) this.y -= moveSpeed;
      if(this.down) this.y += moveSpeed;
      if(this.left) this.x -= moveSpeed;
      if(this.right) this.x += moveSpeed;

      if(this.up && this.left
      ||this.up && this.right
      ||this.down && this.left
      ||this.down && this.right) {
         moveSpeed *= 0.7;
      }
   }

   calcDamage() {
      return this.damageMin + this.randomize(this.damageMax - this.damageMin);
   }

   death() {
      this.walkSpeed = 0;
      this.health = 0
      this.damage = 0;
      this.displayDamage = "";
      this.isDead = true;
   }
}

module.exports = Player;