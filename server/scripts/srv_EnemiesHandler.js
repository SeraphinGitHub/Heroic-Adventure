
"use strict"

const Enemy = require("../classes/Enemy.js");

const mobSrc = "client/images/enemiesAnim/";

// =====================================================================
// Set Golems
// =====================================================================
const set_Golems = () => {

   const spawns = [
      {x: 1100, y: 760},
      {x: 2300, y: 940},
      {x: 770, y: 2210},
   ];

   const stats = {

      name: "Ice Golem",
      health: 150,
      radius: 55,
      wanderRange: 150,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      animationDelay: 0.5,
      GcD: 60,
      getFameCost: 150,
      looseFameCost: 250,
      looseFameCost: 250,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,

      // Animation
      imageSrc: mobSrc + "golems/golem Ice x2.png",

      animSpecs: {
         idle: {
            index: 3,
            spritesNumber: 18,
         },
      
         walk: {
            index: 2,
            spritesNumber: 24,
         },

         run: {
            index: 1,
            spritesNumber: 24,
         },
      
         attack: {
            index: 2,
            spritesNumber: 12,
         },
      
         died: {
            index: 2,
            spritesNumber: 15,
         },
      },

      sprites: {
         height: 200,
         width: 200,
         sizeRatio: 0.95,
         offsetX: 5,
         offsetY: -5,
         radius: 50,
      },
   }

   addToMobList(spawns, stats);
}


// =====================================================================
// Set Minotaurs
// =====================================================================
const set_Minotaurs = () => {

   const spawns = [
      {x: 850, y: 260},
      {x: 340, y: 510},
      {x: 1960, y: 1700},
   ];

   const stats = {

      name: "Plains Minotaur",
      health: 150,
      radius: 55,
      wanderRange: 150,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      animationDelay: 0.7,
      GcD: 60,
      getFameCost: 150,
      looseFameCost: 250,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,

      // Animation
      imageSrc: mobSrc + "minotaurs/minotaur Brown x2.png",

      animSpecs: {
         idle: {
            index: 3,
            spritesNumber: 12,
         },
      
         walk: {
            index: 2,
            spritesNumber: 18,
         },

         run: {
            index: 1,
            spritesNumber: 18,
         },
      
         attack: {
            index: 2,
            spritesNumber: 12,
         },
      
         died: {
            index: 2,
            spritesNumber: 15,
         },
      },

      sprites: {
         height: 200,
         width: 294,
         sizeRatio: 0.7,
         offsetX: 45,
         offsetY: 25,
         radius: 50,
      },
   }

   addToMobList(spawns, stats);
}


// =====================================================================
// Set Orcs
// =====================================================================
const set_Orcs = () => {

   const spawns = [
      {x: 430, y: 1960},
      {x: 420, y: 1270},
      {x: 2720, y: 2210},
   ];

   const stats = {

      name: "Orc",
      health: 150,
      radius: 55,
      wanderRange: 150,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      animationDelay: 0.5,
      GcD: 60,
      getFameCost: 150,
      looseFameCost: 250,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,

      // Animation
      imageSrc: mobSrc + "orcs/orc Pony Tail x2.png",

      animSpecs: {
         idle: {
            index: 3,
            spritesNumber: 18,
         },
      
         walk: {
            index: 2,
            spritesNumber: 24,
         },

         run: {
            index: 1,
            spritesNumber: 24,
         },
      
         attack: {
            index: 2,
            spritesNumber: 12,
         },
      
         died: {
            index: 2,
            spritesNumber: 15,
         },
      },

      sprites: {
         height: 200,
         width: 200,
         sizeRatio: 0.95,
         offsetX: 5,
         offsetY: -2,
         radius: 50,
      },
   }

   addToMobList(spawns, stats);
}


// =====================================================================
// Set Reapers
// =====================================================================
const set_Reapers = () => {

   const spawns = [
      {x: 3150, y: 1450},
      {x: 1920, y: 260},
      {x: 2900, y: 845},
   ];

   const stats = {

      name: "Forest Reaper",
      health: 150,
      radius: 55,
      wanderRange: 150,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      animationDelay: 0.6,
      GcD: 60,
      getFameCost: 150,
      looseFameCost: 250,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,

      // Animation
      imageSrc: mobSrc + "reapers/reaper Man Green x2.png",

      animSpecs: {
         idle: {
            index: 3,
            spritesNumber: 18,
         },
      
         walk: {
            index: 2,
            spritesNumber: 24,
         },

         run: {
            index: 1,
            spritesNumber: 24,
         },
      
         attack: {
            index: 2,
            spritesNumber: 12,
         },
      
         died: {
            index: 2,
            spritesNumber: 15,
         },
      },

      sprites: {
         height: 200,
         width: 200,
         sizeRatio: 0.9,
         offsetX: 10,
         offsetY: 5,
         radius: 50,
      },
   }

   addToMobList(spawns, stats);
}


// =====================================================================
// Set Wraiths
// =====================================================================
const set_Wraiths = () => {

   const spawns = [
      {x: 1790, y: 2300},
      {x: 3150, y: 260},
      {x: 1110, y: 1610},
   ];

   const stats = {

      name: "Dreams Wraith",
      health: 220,
      radius: 55,
      wanderRange: 150,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      animationDelay: 0.7,
      GcD: 60,
      getFameCost: 200,
      looseFameCost: 300,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 20,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,

      // Animation
      imageSrc: mobSrc + "wraiths/wraith Purple x2.png",

      animSpecs: {
         idle: {
            index: 3,
            spritesNumber: 12,
         },
      
         walk: {
            index: 2,
            spritesNumber: 12,
         },

         run: {
            index: 1,
            spritesNumber: 12,
         },
      
         attack: {
            index: 2,
            spritesNumber: 12,
         },
      
         died: {
            index: 2,
            spritesNumber: 15,
         },
      },

      sprites: {
         height: 162,
         width: 200,
         sizeRatio: 0.95,
         offsetX: 7,
         offsetY: 17,
         radius: 50,
      },
   }

   addToMobList(spawns, stats);
}


// =====================================================================
// Add Enemies to initMobList
// =====================================================================
const addToMobList = (enemySpawnObj, enemySpecs) => {

   enemySpawnObj.forEach(position => {
      initMobList.push( new Enemy(position.x, position.y, enemySpecs) );
   });
}


// =====================================================================
// Init Enemies
// =====================================================================
let initMobList = [];

exports.initEnemies = () => {

   set_Golems();
   set_Minotaurs();
   set_Orcs();
   set_Reapers();
   set_Wraiths();

   return initMobList;
}