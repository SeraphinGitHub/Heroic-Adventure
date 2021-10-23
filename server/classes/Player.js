
"use strict"

class Player {
   constructor(id) {
      this.id = id;

      // Player Hitbox
      this.x = 200;
      this.y = 200;
      this.radius = 50;
      this.angle = 0;
      this.color = "darkviolet";

      // Attack Hitbox
      this.atkOffset = 25;
      this.atkOffset_X = 0;
      this.atkOffset_Y = this.atkOffset;
      this.atkRadius = 40;
      this.atkAngle = 0;
      this.atkColor = "orangered";

      // Health
      this.baseHealth = 300;
      this.deathCounts = 0;
      this.baseRespawnTimer = 10; //<== seconds
      
      // Energy
      this.baseEnergy = 90;
      this.energyCost = 1.2;
      this.regenEnergy = 0.2;

      // Mana
      this.baseMana = 150;
      this.spellCost = 100;
      this.regenMana = 0.12;
      this.baseHealing = this.baseHealth * 0.25;
      this.calcHealing;
      
      // Damages
      this.baseAttackSpeed = 1.2; //<== seconds
      this.baseDamage = 15;
      this.calcDamage;
      
      // Specs = BaseSpecs
      this.health = this.baseHealth;
      this.mana = this.baseMana;
      this.energy = this.baseEnergy;
      this.attackSpeed = this.baseAttackSpeed;
      this.respawnTimer = this.baseRespawnTimer;

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
      this.isHealing = false;
      this.isGettingDamage = false;
      this.isRespawning = false;
   }

   update() {
      if(!this.isDead) {

         let moveSpeed;
         if(!this.isRunning) moveSpeed = this.walkSpeed;
         else moveSpeed = this.runSpeed;
         
         // Cross
         if(this.up) {
            this.y -= moveSpeed;
            this.atkOffset_X = 0;
            this.atkOffset_Y = -this.atkOffset;
         }
         
         if(this.down) {
            this.y += moveSpeed;
            this.atkOffset_X = 0;
            this.atkOffset_Y = this.atkOffset;
         }
         
         if(this.left) {
            this.x -= moveSpeed;
            this.atkOffset_X = -this.atkOffset;
            this.atkOffset_Y = 0;
         }
         
         if(this.right) {
            this.x += moveSpeed;
            this.atkOffset_X = this.atkOffset;
            this.atkOffset_Y = 0;
         }
         
         // Diagonale
         if(this.up && this.left) {
            this.atkOffset_X = -this.atkOffset;
            this.atkOffset_Y = -this.atkOffset;
         }

         if(this.up && this.right) {
            this.atkOffset_X = this.atkOffset;
            this.atkOffset_Y = -this.atkOffset;
         }

         if(this.down && this.left) {
            this.atkOffset_X = -this.atkOffset;
            this.atkOffset_Y = this.atkOffset;
         }

         if(this.down && this.right) {
            this.atkOffset_X = this.atkOffset;
            this.atkOffset_Y = this.atkOffset;
         }
         
         // Diag Speed
         if(this.up && this.left
         ||this.up && this.right
         ||this.down && this.left
         ||this.down && this.right) {
            moveSpeed = Math.sqrt(moveSpeed);
         }
      }
   }

   RnG(factor) {
      return Math.floor(Math.random() * factor);
   }

   healRnG() {
      return this.baseHealing + this.RnG(this.baseHealing - this.baseHealing * 0.15);
   }

   damageRnG() {
      return this.baseDamage + this.RnG(this.baseDamage - this.baseDamage * 0.25);
   }

   death() {
      this.health = 0;
      this.isDead = true;
      this.deathCounts++;
      this.color = "blue";
      
      if(this.deathCounts === 10) this.deathCounts = 0;
      this.respawn();
   }

   respawn() {
      const respawnInterval = setInterval(() => {
         if(!this.isRespawning) {

            this.respawnTimer --;
   
            if(this.respawnTimer <= 0) {
               
               this.isDead = false;
               this.isRespawning = true;
               this.health = this.baseHealth;
               this.respawnTimer = this.baseRespawnTimer;
               this.color = "darkviolet";
            }
         }
      }, 1000);

      if(this.isRespawning) {
         clearInterval(respawnInterval);
         this.isRespawning = false;
      }
   }
}

module.exports = Player;