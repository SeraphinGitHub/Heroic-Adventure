
"use strict"

// =====================================================================
// Image Files
// =====================================================================
const imgFiles = () => {
   
   const gameUI = new Image();
   gameUI.src = "client/images/playerUI/Game UI.png";
   
   const player = new Image();
   player.src = "client/images/playerAnim/playerAnim_x4.png";

   const mapTile = new Image();
   mapTile.src = "client/images/map/Map Tiles.png";

   return {
      gameUI: gameUI,
      player: player,
      mapTile: mapTile,
   }
}

const ImgFiles = imgFiles();


// =====================================================================
// Set Player Fame Bar
// =====================================================================
const Fame_Scale = {
   x: 1.5,
   y: 1,
}  

const Fame_Offset = {
   x: 0,
   y: 0,
}

const FameCount_Offset = {
   x: -20,
   y: 80,
}

const Fame = {

   position: {
      x: viewport.width/2 -900/2 * Fame_Scale.x,
      y: viewport.height -870,
      width: 900 * Fame_Scale.x,
      height: 53 * Fame_Scale.y,
   },

   offset: {
      x: 32,
      y: 19,
      width: 65,
      height: 27,
   },
}

// Frame & Backgroud
const FAME_DrawFrame = () => {

   // Background
   ctx.fixedBack.drawImage(
      ImgFiles.gameUI,
      522, 477, 26, 48,
      Fame.position.x + (Fame.offset.x *Fame_Scale.x),
      Fame.position.y + Fame.offset.y,
      Fame.position.width - (Fame.offset.width *Fame_Scale.x),
      Fame.position.height - Fame.offset.height
   );

   // Fame Sprite
   ctx.fixedFront.drawImage(
      ImgFiles.gameUI,
      794, 7, 1701, 87,
      Fame.position.x,
      Fame.position.y,
      Fame.position.width,
      Fame.position.height
   );
}

// FameBar
const FAME_DrawBar = (eventPack) => {
   
   let fameBarWidth = Math.floor(
      (eventPack.fameValue /eventPack.baseFame) * (Fame.position.width - (Fame.offset.width * Fame_Scale.x))
   );

   // Fame Bar
   ctx.fixedUI.drawImage(
      ImgFiles.gameUI,
      522, 529, 26, 48,
      Fame.position.x + (32 * Fame_Scale.x),
      Fame.position.y + 19,
      fameBarWidth,
      Fame.position.height - 27
   );
}

// Count Number
const FAME_DrawCount = (eventPack) => {

   // Fame Count   
   ctx.fixedUI.fillStyle = "darkviolet";
   ctx.fixedUI.font = "40px Dimbo-Regular";
   ctx.fixedUI.fillText(
      eventPack.fameCount,
      Fame.position.x +Fame.position.width +FameCount_Offset.x,
      Fame.position.y +FameCount_Offset.y
   );
   ctx.fixedUI.strokeText(
      eventPack.fameCount,
      Fame.position.x +Fame.position.width +FameCount_Offset.x,
      Fame.position.y +FameCount_Offset.y
   );
}


// =====================================================================
// Set Player HUD
// =====================================================================
const HUD_Scale = {
   x: 1.2,
   y: 1,
}  

const HUD_Offset = {
   x: 0,
   y: 0,
}

const HUD = {
   position: {
      x: viewport.width/2 -400/2 *HUD_Scale.x +HUD_Offset.x,
      y: viewport.height -110 *HUD_Scale.y +HUD_Offset.y,
      width: 400 *HUD_Scale.x,
      height: 100 *HUD_Scale.y,
   },

   manaOffset: {
      x: 82,
      y: 10,
      width: 165,
      height: 8,
   },

   healthOffset: {
      x: 15,
      y: 39,
      width: 30,
      height: 9,
   },

   energyOffset: {
      x: 82,
      y: 65,
      width: 165,
      height: 8,
   },

   flashing: {
      frame: 0,
      speed: 6,      // Lower ==> faster
      minRatio: 0.3, // Min Health before flash (%)
   }
}

// Template Bar
const HUD_BaseBar = (sx, sy, sw, sh, ratio, offset)  => {
   
   let barWidth = Math.floor(
      (HUD.position.width - (offset.width * HUD_Scale.x) ) *ratio
   );

   ctx.UI.drawImage(
      ImgFiles.gameUI,
      sx, sy, sw *ratio, sh,
      HUD.position.x + (offset.x * HUD_Scale.x),
      HUD.position.y + (offset.y * HUD_Scale.y),
      barWidth,
      HUD.position.height/3 - (offset.height * HUD_Scale.y)
   );
}

// Frame & Backgroud
const HUD_DrawFrame = () => {

   ctx.fixedFront.shadowBlur = "2";
   ctx.fixedFront.shadowColor = "black";

   // Background
   ctx.fixedBack.drawImage(
      ImgFiles.gameUI,
      5, 181, 729, 141,
      HUD.position.x + (15 * HUD_Scale.x),     // Pos X
      HUD.position.y + (10 * HUD_Scale.y),     // Pos Y
      HUD.position.width - (30 * HUD_Scale.x), // Width
      HUD.position.height - (20 * HUD_Scale.y) // Height
   );

   // HUD Sprite
   ctx.fixedFront.drawImage(
      ImgFiles.gameUI,
      5, 4, 782, 173,
      HUD.position.x,
      HUD.position.y,
      HUD.position.width,
      HUD.position.height
   );
}

// Mana Bar
const HUD_DrawMana = (initPack, updatePlayer) => {
   
   let manaRatio = updatePlayer.mana / initPack.baseMana;
   
   // Still Castable Mana
   if(updatePlayer.mana >= initPack.healCost) HUD_BaseBar(
      6, 528, 460, 47,
      manaRatio,
      HUD.manaOffset
   );
   
   // Low Mana
   else HUD_BaseBar(
      5, 475, 461, 47,
      manaRatio,
      HUD.manaOffset
   ); 
}

// Health Bar
const HUD_DrawHealth = (initPack, updatePlayer) => {

   let healthRatio = updatePlayer.health /initPack.baseHealth;

   // if Health Over 30% ==> Normal Bar
   if(updatePlayer.health > initPack.baseHealth * HUD.flashing.minRatio) HUD_BaseBar(
      5, 327, 729, 45,
      healthRatio,
      HUD.healthOffset
   );

   // if Health Under 30% ==> Flashing Bar
   else {
      HUD_BaseBar(
         6, 424, 729, 45,
         healthRatio,
         HUD.healthOffset
      );

      HUD.flashing.frame++;

      if(HUD.flashing.frame > HUD.flashing.speed) {

         // Normal Bar
         HUD_BaseBar(
            5, 327, 729, 45,
            healthRatio,
            HUD.healthOffset
         );
      }

      if(HUD.flashing.frame > HUD.flashing.speed *2) HUD.flashing.frame = 0;
   }
}

// Energy Bar
const HUD_DrawEnergy = (initPack, updatePlayer) => {
   
   let energyRatio = updatePlayer.energy / initPack.baseEnergy;

   // Yellow Bar
   HUD_BaseBar(
      6, 582, 460, 46,
      energyRatio,
      HUD.energyOffset
   );
}