
"use strict"

class Player {
   constructor(id) {
      this.id = id;

      // Player Hitbox
      this.x = 600;
      this.y = 400;
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
      this.attackSpeed = 100* ( 0.6 ); //<== seconds
      this.attackCooldown = this.attackSpeed;

      // Damages
      this.baseDamage = 25;
      this.calcDamage;
      
      // Movements
      this.walkSpeed = 7;
      this.baseWalkSpeed = this.walkSpeed;
      this.runSpeed = 15;
      this.up = false;
      this.down = false;
      this.left = false;
      this.right = false;

      // States
      this.isDead = false;
      this.isRunning = false;
      this.isAttacking = false;
      this.canAttack = true;
      this.isHealing = false;
      this.isGettingDamage = false;
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