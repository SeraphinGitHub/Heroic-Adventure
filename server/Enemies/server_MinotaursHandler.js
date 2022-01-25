
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
      wanderBreakTime: 1 *1000,
      wanderRange: 100,
      chasingRange: 300,
      GcD: 50,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,
   }
   
   const minotaur_1 = new Enemy(800, 600, minotaursSpecs);
   const minotaur_2 = new Enemy(1400, 600, minotaursSpecs);
   const minotaur_3 = new Enemy(1000, 1100, minotaursSpecs);

   minotaursList.push(minotaur_1, minotaur_2, minotaur_3);
   mobList.push(minotaur_1, minotaur_2, minotaur_3);

   // minotaursList.push(minotaur_1);
   // mobList.push(minotaur_1);
}


// =====================================================================
// Minotaurs Movements
// =====================================================================
const minotaurMovements = (minotaur) => {

   minotaur.wandering();
   
   // Cross Move
   if(minotaur.y > minotaur.calcY) minotaur.frameY = 0; // Up
   if(minotaur.y < minotaur.calcY) minotaur.frameY = 1; // Down
   if(minotaur.x > minotaur.calcX) minotaur.frameY = 2; // Left
   if(minotaur.x < minotaur.calcX) minotaur.frameY = 3; // Right

   // Diag Move
   if(minotaur.y > minotaur.calcY && minotaur.x > minotaur.calcX
   || minotaur.y > minotaur.calcY && minotaur.x < minotaur.calcX) minotaur.frameY = 0; // Top Left / Top Right
   if(minotaur.y < minotaur.calcY && minotaur.x > minotaur.calcX
   || minotaur.y < minotaur.calcY && minotaur.x < minotaur.calcX) minotaur.frameY = 1; // Down Left / Down Right
}




// =====================================================================
// Handle Player State
// =====================================================================
const anim = {
   idle: {
      index: 2,
      spritesNumber: 29,
   },

   walk: {
      index: 1,
      spritesNumber: 29,
   },

   died: {
      index: 3,
      spritesNumber: 29,
   },
}

const handlePlayerState = (minotaur) => {
   
   // Idle State
   if(minotaur.x === minotaur.calcX && minotaur.y === minotaur.calcY) {
      minotaur.animation(frame, anim.idle.index, anim.idle.spritesNumber);
      return minotaur.state = "idle";
   }

   // Walk State
   else {
      minotaur.animation(frame, anim.walk.index, anim.walk.spritesNumber);
      return minotaur.state = "walk";
   }
}



// =====================================================================
// Minotaur Update (Every frame)
// =====================================================================
let frame = 0

exports.minotaurUpdate = () => {
   let minotaurData = [];
   
   for(let i in minotaursList) {
      let minotaur = minotaursList[i];
      
      if(!minotaur.isDead) {
         handlePlayerState(minotaur);
         minotaurMovements(minotaur);
      }

      else {
         minotaur.animation(frame, anim.died.index, anim.died.spritesNumber);
         minotaur.state = "died";
      }

      minotaurData.push(minotaur);
   }

   frame++;
   return minotaurData;
}