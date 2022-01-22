
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

   // const minotaursCount = 4;
   const minotaursCount = 1;

   const minotaursSpecs = {

      health: 100,
      radius: 50,
      GcD: 50,
      respawn: 5000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 2,
      runSpeed: 6,
   }
   
   for(let i = 0; i < minotaursCount; i++) {
      
      // const minotaurX = 400 + Math.floor(Math.random() * 5) * 400;
      // const minotaurY = 200 + Math.floor(Math.random() * 5) * 200;
      
      const minotaur = new Enemy(800, 600, minotaursSpecs);
      // const minotaur = new Enemy(minotaurX, minotaurY, minotaursSpecs);
      minotaursList.push(minotaur);
      mobList.push(minotaur);
   }
}


// =====================================================================
// Minotaurs Movements
// =====================================================================
const maxWanderRange = 100;

const minotaurMovements = (minotaur) => {

   minotaur.wanderingDir(maxWanderRange);
}


// =====================================================================
// Minotaur Update (Every frame)
// =====================================================================
exports.minotaurUpdate = () => {
   let minotaurData = [];
   
   for(let i in minotaursList) {
      let minotaur = minotaursList[i];
      
      if(!minotaur.isDead) {
         // minotaurMovements(minotaur);
      }

      else {
         return;
      }

      minotaurData.push(minotaur);
   }

   return minotaurData;
}