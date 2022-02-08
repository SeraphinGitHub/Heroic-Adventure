
"use strict"

class Player {
   constructor(id) {
      
      this.id = id;
      this.name = "";
      
      this.x = 1080;
      this.y = 800;
      
      // Env Variables
      this.frameRate = process.env.FRAME_RATE;
      this.syncCoeff = process.env.SYNC_COEFF;

      // Player Hitbox
      this.radius = 42;

      // Attack Hitbox
      this.attkOffset_X = 0;
      this.attkOffset_Y = 45;
      this.attkRadius = 32;

      // Respawn Time
      this.baseRespawnTimer = 10; //<== seconds
      this.respawnTimer = this.baseRespawnTimer;
      this.deathCounts = 0;
      
      // GcD
      this.baseGcD = 30;
      this.GcD = this.syncCoeff * this.baseGcD; // More high ==> more slow
      this.speedGcD = this.GcD;

      // Player Health
      this.baseHealth = 250;
      this.health = this.baseHealth;

      // Player Energy
      this.baseEnergy = 200;
      this.energy = this.baseEnergy;
      this.energyCost = 0.7;
      this.baseRegenEnergy = 0.15;
      this.regenEnergy = this.syncCoeff * this.baseRegenEnergy;

      // Player Mana
      this.baseMana = 150;
      this.mana = this.baseMana;
      this.baseRegenMana = 0.12;
      this.regenMana = this.syncCoeff * this.baseRegenMana;

      // Fame
      this.baseFame = 10000;
      this.fame = 0;
      this.fameValue = this.fame;
      this.fameCount = 0;

      // Spells cast
      this.cast_Heal = false;
      
      // Spell - Healing
      this.healCost = 70;
      this.baseHealing = this.baseHealth * 0.25; // <== Healing = 25% from MaxHealth
      this.calcHealing;

      // Damages
      // this.baseDamage = 4000;
      this.baseDamage = 23;
      this.calcDamage;
      
      // Movements Speed
      this.walkSpeed = Math.round(this.syncCoeff * 3); // <== WalkSpeed
      this.baseWalkSpeed = this.walkSpeed;
      this.runSpeed = Math.round(this.syncCoeff * 7); // <== RunSpeed
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

   circle_toCircle = (first, second, offsetX, offsetY, radius) => {
      let dx = second.x - (first.x + offsetX);
      let dy = second.y - (first.y + offsetY);
      let distance = Math.sqrt(dx * dx + dy * dy);
      let sumRadius = radius + second.radius;
   
      if(distance <= sumRadius) return true;
   }

   death(fameCost) {
      
      const respawnRange = 600;

      this.health = 0;
      this.isDead = true;
      this.died++;

      this.deathCounts++;
      if(this.deathCounts === 10) this.deathCounts = 0;

      this.fame -= fameCost;
      if(this.fame <= 0) this.fame = 0;
      
      this.fameValue -= fameCost;
      if(this.fameValue <= 0) this.fameValue = 0;
      
      const respawnCooldown = setInterval(() => {
         this.respawnTimer --;
         
         if(this.respawnTimer <= 0) {

            this.isDead = false;
            this.isRespawning = true;

            // Reset Player Bars
            this.health = this.baseHealth;
            this.mana = this.baseMana;
            this.energy = this.baseEnergy;
            this.speedGcD = this.GcD;

            // Reset Respawn Timer
            this.respawnTimer = this.baseRespawnTimer;
            this.color = "darkviolet"; // <== Debug Mode
            
            // Randomize position on respawn
            this.x = (this.x -respawnRange/2) + Math.round(Math.random() * respawnRange);
            this.y = (this.y -respawnRange/2) + Math.round(Math.random() * respawnRange);

            clearInterval(respawnCooldown);
         }
      }, 1000);
   }

   animation(frame, index, spritesNumber) {
      if(frame % index === 0) {       
         if(this.frameX < spritesNumber) this.frameX++;
         else this.frameX = 0;
      }
   }
}

module.exports = Player;