
"use strict"

// =====================================================================
// Fame Bar
// =====================================================================



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

const setHUD = (viewport) => {

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

   return HUD;
}

// Template Bar
const HUD_BaseBar = (sx, sy, sw, sh, ratio, offset)  => {
   
   let barWidth = Math.floor(
      (HUD.position.width - (offset.width * HUD_Scale.x) ) *ratio
   );

   ctx.UI.drawImage(
      imgFile().gameUI_Img,
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
      imgFile().gameUI_Img,
      5, 181, 729, 141,
      HUD.position.x + (15 * HUD_Scale.x),     // Pos X
      HUD.position.y + (10 * HUD_Scale.y),     // Pos Y
      HUD.position.width - (30 * HUD_Scale.x), // Width
      HUD.position.height - (20 * HUD_Scale.y) // Height
   );

   // HUD Sprite
   ctx.fixedFront.drawImage(
      imgFile().gameUI_Img,
      5, 4, 782, 173,
      HUD.position.x,
      HUD.position.y,
      HUD.position.width,
      HUD.position.height
   );
}

// Mana Bar
const HUD_DrawMana = (initPlayer, updatePlayer) => {
   
   let manaRatio = updatePlayer.mana / initPlayer.baseMana;
   
   // Still Castable Mana
   if(updatePlayer.mana >= initPlayer.healCost) HUD_BaseBar(
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
const HUD_DrawHealth = (initPlayer, updatePlayer) => {

   let healthRatio = updatePlayer.health /initPlayer.baseHealth;

   // if Health Over 30% ==> Normal Bar
   if(updatePlayer.health > initPlayer.baseHealth * HUD.flashing.minRatio) HUD_BaseBar(
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
const HUD_DrawEnergy = (initPlayer, updatePlayer) => {
   
   let energyRatio = updatePlayer.energy / initPlayer.baseEnergy;

   // Yellow Bar
   HUD_BaseBar(
      6, 582, 460, 46,
      energyRatio,
      HUD.energyOffset
   );
}