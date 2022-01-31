
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

   const minotaursSpawns = [
      {x: 800, y: 600},
      {x: 1400, y: 600},
      {x: 1000, y: 1100},
   ];

   const minotaursSpecs = {

      health: 100,
      radius: 55,
      wanderRange: 120,
      wanderBreakTime: 2 *1000,
      chasingRange: 300,
      GcD: 50,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,
   }
   
   minotaursSpawns.forEach(position => {
      const minotaur = new Enemy(position.x, position.y, minotaursSpecs);
      minotaursList.push(minotaur);
      mobList.push(minotaur);
   });

}


// =====================================================================
// Minotaurs Movements
// =====================================================================
const minotaurMovements = (minotaur) => {

   minotaur.wandering();
   
   // ===== 4 Directions Sprites Sheets =====
      // // Cross Move
      // if(minotaur.y > minotaur.calcY) minotaur.frameY = 0; // Up
      // if(minotaur.y < minotaur.calcY) minotaur.frameY = 1; // Down
      // if(minotaur.x > minotaur.calcX) minotaur.frameY = 2; // Left
      // if(minotaur.x < minotaur.calcX) minotaur.frameY = 3; // Right

      // // Diag Move
      // if(minotaur.y > minotaur.calcY && minotaur.x > minotaur.calcX
      // || minotaur.y > minotaur.calcY && minotaur.x < minotaur.calcX) minotaur.frameY = 0; // Top Left / Top Right
      // if(minotaur.y < minotaur.calcY && minotaur.x > minotaur.calcX
      // || minotaur.y < minotaur.calcY && minotaur.x < minotaur.calcX) minotaur.frameY = 1; // Down Left / Down Right
   // ===== 4 Directions Sprites Sheets =====


   // ===== 2 Directions Sprites Sheets =====
      // Cross Move
      if(minotaur.y > minotaur.calcY || minotaur.x > minotaur.calcX) minotaur.frameY = 0; // Left
      if(minotaur.y < minotaur.calcY || minotaur.x < minotaur.calcX) minotaur.frameY = 1; // Right

      // Diag Move
      if(minotaur.y > minotaur.calcY && minotaur.x > minotaur.calcX
      || minotaur.y < minotaur.calcY && minotaur.x > minotaur.calcX) minotaur.frameY = 0; // Top / Down Left
      if(minotaur.y > minotaur.calcY && minotaur.x < minotaur.calcX
      || minotaur.y < minotaur.calcY && minotaur.x < minotaur.calcX) minotaur.frameY = 1; // Top / Down Right
   // ===== 2 Directions Sprites Sheets =====
}


// =====================================================================
// Handle Minotaur State
// =====================================================================
const anim = {
   idle: {
      index: 3,
      spritesNumber: 11,
   },

   walk: {
      index: 2,
      spritesNumber: 17,
   },

   died: {
      index: 2,
      spritesNumber: 14,
   },
}

const handleMinotaurState = (minotaur) => {
   
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
         handleMinotaurState(minotaur);
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