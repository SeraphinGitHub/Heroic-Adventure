
"use strict"

class Player {
   constructor(id) {
      this.id = id;

      // Player Hitbox
      this.x = Math.floor(Math.random() * 1000) + 100; // <== Randomize position on load
      this.y = Math.floor(Math.random() * 700) + 50;
      // this.x = 600;
      // this.y = 400;
      this.radius = 40;
      this.angle = 0;
      this.color = "darkviolet";

      // Attack Hitbox
      this.attkOffset = 20;
      this.attkOffset_X = 0;
      this.attkOffset_Y = this.attkOffset;
      this.attkRadius = 30;
      this.attkAngle = 0;
      this.attkColor = "orangered";

      // Health
      this.baseHealth = 200;
      this.health = this.baseHealth;

      // Respawn
      this.baseRespawnTimer = 10; //<== seconds
      this.respawnTimer = this.baseRespawnTimer;
      this.deathCounts = 0;
      
      // Global Count Down
      this.baseGcD = 30;
      this.GcD = process.env.SYNC_COEFF* this.baseGcD; // More high ==> more slow
      this.speedGcD = this.GcD;

      // Energy
      this.baseEnergy = 150;
      this.energy = this.baseEnergy;
      this.energyCost = 0.8;
      this.baseRegenEnergy = 0.2;
      this.regenEnergy = process.env.SYNC_COEFF* this.baseRegenEnergy;

      // Mana
      this.baseMana = 150;
      this.mana = this.baseMana;
      this.baseRegenMana = 0.12;
      this.regenMana = process.env.SYNC_COEFF* this.baseRegenMana;

      // Spells cast
      this.cast_Heal = false;
      
      // Spell - Healing
      this.healCost = 70;
      this.baseHealing = this.baseHealth * 0.25; // <== Healing = 25% MaxHealth
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
      this.isHealing = false;
      this.isRunning = false;
      this.isAttacking = false;
      this.isGettingDamage = false;

      // Score
      this.kills = 0;
      this.died = 0;

      // Animation
      this.frameX = 0;
      this.frameY = 0;
      this.minFrame = 0;
      this.maxFrame = 29;
      this.spriteWidth = 152;
      this.spriteHeight = 152;
   }

   RnG(baseSpec, coeff) {
      return baseSpec + Math.floor(Math.random() * (baseSpec - baseSpec * coeff));
   }

   healRnG() {
      return this.RnG(this.baseHealing, 0.35); // More low => Shorter RnG Range => More heal
   }

   damageRnG() {
      return this.RnG(this.baseDamage, 0.20); // More low => Shorter RnG Range => More damage
   }
}

module.exports = Player;