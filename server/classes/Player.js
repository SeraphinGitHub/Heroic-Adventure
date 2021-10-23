
"use strict"

class Player {
   constructor(id) {
      this.id = id;

      // Health & Death
      // this.health = 200;
      this.health = 1;
      this.deathCounts = 0;
      this.deathMessage = "You died !";
      this.deathMessage_OffsetX = 130;

      // Damages
      this.damageMin = 15;
      this.damageMax = 20;
      this.damageBonus = 0;
      this.damageValue = "";

      // Hitbox
      this.x = 200;
      this.y = 200;
      this.radius = 60;
      this.angle = 0;
      this.color = "darkviolet";

      // Movements
      this.walkSpeed = 7;
      this.runSpeed = 15;
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      // States
      this.isDead = false;
      this.isRunning = false;
      this.isAttacking = false;
   }

   update() {
      if(!this.isDead) {

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
            moveSpeed = Math.sqrt(moveSpeed);
         }
      }
   }

   randomize(factor) {
      return Math.floor(Math.random() * factor);
   }

   calcDamage() {
      return this.damageMin + this.randomize(this.damageMax - this.damageMin) + this.damageBonus;
   }

   death() {
      this.health = 0
      this.isDead = true;
      this.deathCounts++;
      this.color = "blue";

      if(this.deathCounts === 4) {
         this.deathMessage = "You died like a bitch !";
         this.deathMessage_OffsetX = 340;
      }
      
      if(this.deathCounts === 8) {
         this.deathMessage = "Wasted !";
         this.deathMessage_OffsetX = 140;
      }
      
      if(this.deathCounts === 9) this.deathCounts = 0;
   }
}

module.exports = Player;