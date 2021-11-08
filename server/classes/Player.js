
"use strict"

class Player {
   constructor(id) {
      this.id = id;
      this.name = "";

      // Player Hitbox
      this.x = Math.floor(Math.random() * 1000) + 100; // <== Randomize position on load
      this.y = Math.floor(Math.random() * 700) + 50; // depend of canvas size (1000 x 700)
      this.radius = 42;

      // Attack Hitbox
      this.attkOffset_X = 0;
      this.attkOffset_Y = 45;
      this.attkRadius = 32;

      // Respawn Time
      this.baseRespawnTimer = 10; //<== seconds
      this.respawnTimer = this.baseRespawnTimer;
      this.deathCounts = 0;
      
      // Global Count Down
      this.baseGcD = 30;
      this.GcD = process.env.SYNC_COEFF* this.baseGcD; // More high ==> more slow
      this.speedGcD = this.GcD;

      // Player Health
      this.baseHealth = 250;
      this.health = this.baseHealth;

      // Player Energy
      this.baseEnergy = 150;
      this.energy = this.baseEnergy;
      this.energyCost = 0.8;
      this.baseRegenEnergy = 0.2;
      this.regenEnergy = process.env.SYNC_COEFF* this.baseRegenEnergy;

      // Player Mana
      this.baseMana = 150;
      this.mana = this.baseMana;
      this.baseRegenMana = 0.12;
      this.regenMana = process.env.SYNC_COEFF* this.baseRegenMana;

      // Spells cast
      this.cast_Heal = false;
      
      // Spell - Healing
      this.healCost = 70;
      this.baseHealing = this.baseHealth * 0.25; // <== Healing = 25% from MaxHealth
      this.calcHealing;

      // Damages
      this.baseDamage = 25;
      this.calcDamage;
      
      // Movements Speed
      this.walkSpeed = process.env.SYNC_COEFF* 3; // <== WalkSpeed
      this.baseWalkSpeed = this.walkSpeed;
      this.runSpeed = process.env.SYNC_COEFF* 7; // <== RunSpeed
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

      // Anim States
      this.attack_isAnimable = false;
      this.heal_isAnimable = false;

      // Score
      this.kills = 0;
      this.died = 0;

      // Animation
      this.state;
      this.frameX = 0;
      this.frameY = 1;
   }

   RnG(baseSpec, coeff) {
      return Math.floor(baseSpec) + Math.floor(Math.random() * (baseSpec * coeff));
   }

   healRnG() {
      return this.RnG(this.baseHealing, 0.57); // More high => Higher RnG Range => More heal
   }

   damageRnG() {
      return this.RnG(this.baseDamage, 0.62); // More high => Higher RnG Range => More damage
   }

   animation(frame, index, spritesNumber) {
      if(frame % index === 0) {       
         if(this.frameX < spritesNumber) this.frameX++;
         else this.frameX = 0;
      }
   }
}

module.exports = Player;