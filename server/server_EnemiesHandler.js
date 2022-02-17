
"use strict"

const Enemy = require("./classes/Enemy.js");

// =====================================================================
// Set Minotaurs
// =====================================================================
const set_Minotaurs = () => {

   const minotaursSpawns = [
      {x: 650, y: 500},
      {x: 1500, y: 500},
      {x: 750, y: 1150}
   ];

   const minotaursSpecs = {

      name: "Plains Minotaur",
      health: 150,
      radius: 55,
      wanderRange: 150,
      wanderBreakTime: 2 *1000,
      chasingRange: 200,
      GcD: 60,
      getFameCost: 100,
      looseFameCost: 200,
      hiddenTime: 4 *1000,
      respawnTime: 10 *1000,
      damages: 15,
      attackDelay: 0.5,
      damageRatio: 0.5,
      walkSpeed: 3,
      runSpeed: 6,

      // Animation
      imageSrc: "client/images/enemiesAnim/minotaurs/minotaurAnim_x4.png",

      animSpecs: {
         idle: {
            index: 3,
            spritesNumber: 11,
         },
      
         walk: {
            index: 2,
            spritesNumber: 17,
         },

         run: {
            index: 1,
            spritesNumber: 17,
         },
      
         attack: {
            index: 2,
            spritesNumber: 11,
         },
      
         died: {
            index: 2,
            spritesNumber: 14,
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

   addToMobList(minotaursSpawns, minotaursSpecs);
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

   set_Minotaurs();

   return initMobList;
}