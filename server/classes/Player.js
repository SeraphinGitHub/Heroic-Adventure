
"use strict"

class Player {
   constructor(id) {
      this.id = id;

      // Important ==> keep 1.45 for refresh rate of {1000/60}
      this.timerCoeff = 1.45;

      // Player Hitbox
      this.x = 600;
      this.y = 400;
      this.radius = 50;
      this.angle = 0;
      this.color = "darkviolet";

      // Attack Hitbox
      this.attkOffset = 25;
      this.attkOffset_X = 0;
      this.attkOffset_Y = this.attkOffset;
      this.attkRadius = 40;
      this.attkAngle = 0;
      this.attkColor = "orangered";

      // Health
      this.baseHealth = 300;
      this.health = this.baseHealth;

      // Respawn
      this.baseRespawnTimer = 10; //<== seconds
      this.respawnTimer = this.baseRespawnTimer;
      this.deathCounts = 0;
      
      // Energy
      this.baseEnergy = 150;
      this.energy = this.baseEnergy;
      this.energyCost = 1.2;
      this.regenEnergy = 0.2;

      // Mana
      this.baseMana = 150;
      this.mana = this.baseMana;
      this.regenMana = 0.12;

      // Spell - Healing
      this.spellCost = 100;
      this.baseHealing = this.baseHealth * 0.25; // <== Healing = 25% MaxHealth
      this.calcHealing;
      
      // Attack Speed
      this.attackSpeed = 100/ ( 0.8 ); // <== seconds
      this.baseAttackCooldown = 60 * 100 / this.timerCoeff;
      this.attackCooldown = this.baseAttackCooldown;

      // Damages
      this.baseDamage = 15;
      this.calcDamage;
      
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
            this.attkOffset_X = 0;
            this.attkOffset_Y = -this.attkOffset;
         }
         
         if(this.down) {
            this.y += moveSpeed;
            this.attkOffset_X = 0;
            this.attkOffset_Y = this.attkOffset;
         }
         
         if(this.left) {
            this.x -= moveSpeed;
            this.attkOffset_X = -this.attkOffset;
            this.attkOffset_Y = 0;
         }
         
         if(this.right) {
            this.x += moveSpeed;
            this.attkOffset_X = this.attkOffset;
            this.attkOffset_Y = 0;
         }
         
         // Diagonale
         if(this.up && this.left) {
            this.attkOffset_X = -this.attkOffset;
            this.attkOffset_Y = -this.attkOffset;
         }

         if(this.up && this.right) {
            this.attkOffset_X = this.attkOffset;
            this.attkOffset_Y = -this.attkOffset;
         }

         if(this.down && this.left) {
            this.attkOffset_X = -this.attkOffset;
            this.attkOffset_Y = this.attkOffset;
         }

         if(this.down && this.right) {
            this.attkOffset_X = this.attkOffset;
            this.attkOffset_Y = this.attkOffset;
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

   RnG(baseSpec, coeff) {
      return baseSpec + Math.floor(Math.random() * (baseSpec - baseSpec * coeff));
   }

   healRnG() {
      return this.RnG(this.baseHealing, 0.15);
   }

   damageRnG() {
      return this.RnG(this.baseDamage, 0.25);
   }

   // baseRegen(value, baseValue, regenValue) {
   //    if(value < baseValue) return value += regenValue;
   //    if(value > baseValue) return value = baseValue;
   // }

   death() {
      this.health = 0;
      this.isDead = true;
      this.deathCounts++;
      this.color = "blue";
      
      if(this.deathCounts === 10) this.deathCounts = 0;
      
      const respawnCooldown = setInterval(() => {
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
         clearInterval(respawnCooldown);
         this.isRespawning = false;
      }
   }
}

module.exports = Player;