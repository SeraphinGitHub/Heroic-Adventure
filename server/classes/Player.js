
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
      this.baseGcD = process.env.SYNC_COEFF* 30; // More high ==> more slow
      this.speedGcD = this.baseGcD;

      // Energy
      this.baseEnergy = 150;
      this.energy = this.baseEnergy;
      this.energyCost = 1.2;
      this.regenEnergy = process.env.SYNC_COEFF* 0.2;

      // Mana
      this.baseMana = 150;
      this.mana = this.baseMana;
      this.regenMana = process.env.SYNC_COEFF* 0.12;

      // Spell - Healing
      this.healCost = 70;
      this.baseHealing = this.baseHealth * 0.25; // <== Healing = 25% MaxHealth
      this.calcHealing;

      // Damages
      this.baseDamage = 25;
      this.calcDamage;
      
      // Movements Speed
      this.walkSpeed = process.env.SYNC_COEFF* 7;
      this.baseWalkSpeed = this.walkSpeed;
      this.runSpeed = process.env.SYNC_COEFF* 15;
      this.baseRunSpeed = this.runSpeed;
      
      // Movements Axis
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      // States
      this.isDead = false;
      this.isCasting = false;
      this.isRunning = false;
      this.isAttacking = false;
      this.isGettingDamage = false;

      // Spells cast
      this.cast_Heal = false;
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
}

module.exports = Player;