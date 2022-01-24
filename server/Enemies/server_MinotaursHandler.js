
"use strict"

// =====================================================================
// Scrips import
// =====================================================================
const Enemy = require("../classes/Enemy.js");
const collision = require("../collisions.js");


// =====================================================================
// Init Minotaurs
// =====================================================================
let minotaursList = [];

exports.initMinotaurs = (mobList) => {

   const minotaursSpecs = {

      health: 100,
      radius: 50,
      wanderBreakTime: 1500,
      wanderRange: 150,
      chasingRange: 300,
      GcD: 50,
      respawn: 5000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,
   }
   
   const minotaur_1 = new Enemy(600, 600, minotaursSpecs);
   const minotaur_2 = new Enemy(1400, 600, minotaursSpecs);
   const minotaur_3 = new Enemy(1000, 1100, minotaursSpecs);

   minotaursList.push(minotaur_1, minotaur_2, minotaur_3);
   mobList.push(minotaur_1, minotaur_2, minotaur_3);
}


// =====================================================================
// Minotaurs Movements
// =====================================================================
const minotaurMovements = (minotaur) => {
   minotaur.wandering();
}


// =====================================================================
// Minotaur Update (Every frame)
// =====================================================================
exports.minotaurUpdate = () => {
   let minotaurData = [];
   
   for(let i in minotaursList) {
      let minotaur = minotaursList[i];
      
      if(!minotaur.isDead) {
         minotaurMovements(minotaur);
      }

      else {
         return;
         // minotaur.animation(frame, anim.died.index, anim.died.spritesNumber);
         // minotaur.state = "died";
      }

      minotaurData.push(minotaur);
   }

   return minotaurData;
}