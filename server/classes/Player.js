
"use strict"

class Player {
   constructor(id) {
      this.id = id;
      this.walkSpeed = 7;
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
      let walkSpeed = this.walkSpeed;
      let runSpeed = this.runSpeed;

      if(this.isRunning) walkSpeed = runSpeed;

      if(this.up) this.y -= walkSpeed;
      if(this.down) this.y += walkSpeed;
      if(this.left) this.x -= walkSpeed;
      if(this.right) this.x += walkSpeed;

      if(this.up && this.left
      ||this.up && this.right
      ||this.down && this.left
      ||this.down && this.right) {
         walkSpeed *= 0.7;
      }
   }

   death() {
      this.walkSpeed = 0;
      this.health = 0
      this.damage = 0;
      this.isDead = true;
   }
}

module.exports = Player;