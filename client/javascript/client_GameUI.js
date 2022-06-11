
"use strict"

// =====================================================================
// Fame Bar
// =====================================================================



// =====================================================================
// Player HUD
// =====================================================================
const HUD_Scale = {
   x: 1.2,
   y: 1,
}

const initHUD = (viewport) => {

   const HUD = {
      x: viewport.width/2 -400/2 *HUD_Scale.x,
      y: viewport.height -110 *HUD_Scale.y,
      // y: viewport.height -110 * HUD_Scale.y    -30,
      width: 400 *HUD_Scale.x,
      height: 100 *HUD_Scale.y,

      healthOffset: {
         x: 15,
         y: 39,
         width: 30,
         height: 9,
      },

      manaOffset: {
         x: 82,
         y: 10,
         width: 165,
         height: 8,
      },
   }

   HUD_DrawFrame(HUD);
}

const HUD_DrawFrame = (hud) => {

   ctx.fixedFront.shadowBlur = "2";
   ctx.fixedFront.shadowColor = "black";

   // Background
   ctx.fixedBack.drawImage( imgFile().gameUI_Img,
      5, 181, 729, 141,
      hud.x + (15 * HUD_Scale.x),     // Pos X
      hud.y + (10 * HUD_Scale.y),     // Pos Y
      hud.width - (30 * HUD_Scale.x), // Width
      hud.height - (20 * HUD_Scale.y) // Height
   );

   // HUD Sprite
   this.ctxFixedFront.drawImage( imgFile().gameUI_Img,
      5, 4, 782, 173,
      hud.x, hud.x, hud.width, hud.height
   );
}

const HUD_DrawBaseBar = (hud, ratio, sx, sy, sw, sh, offX, offY, offW, offH)  => {
   
   let barWidth = Math.floor(
      (hud.width - (offW * HUD_Scale.x) ) *ratio
   );

   this.ctxUI.drawImage(
      imgFile().gameUI_Img,
      sx, sy, sw *ratio, sh,
      hud.x + (offX * HUD_Scale.x),
      hud.x + (offY * HUD_Scale.y),
      barWidth,
      hud.height/3 - (offH * HUD_Scale.y)
   );
}

const HUD_DrawMana = () => {
   
   let manaRatio = this.updatePlayer.mana / this.initPlayer.baseMana;
   
   // Still Castable Mana
   if(this.updatePlayer.mana >= this.initPlayer.healCost) {

      this.drawHUD_BaseBar(
         manaRatio,
         6, 528, 460, 47,
         this.manaOffset.x,
         this.manaOffset.y,
         this.manaOffset.width,
         this.manaOffset.height
      );
   }
   
   // Low Mana
   else {
      this.drawHUD_BaseBar(
         manaRatio,
         5, 475, 461, 47,
         this.manaOffset.x,
         this.manaOffset.y,
         this.manaOffset.width,
         this.manaOffset.height
      );
   }
}

const HUD_DrawHealth = () => {

   let healthRatio = this.updatePlayer.health /this.initPlayer.baseHealth;

   // if Health Over 30%
   if(this.updatePlayer.health > this.initPlayer.baseHealth * this.minHealthRatio) {

      // Normal Bar
      this.drawHUD_BaseBar(
         healthRatio,
         5, 327, 729, 45,
         this.healthOffset.x,
         this.healthOffset.y,
         this.healthOffset.width,
         this.healthOffset.height
      );
   }

   // if Health Under 30%
   else {

      // Flashing Bar
      this.drawHUD_BaseBar(
         healthRatio,
         6, 424, 729, 45,
         this.healthOffset.x,
         this.healthOffset.y,
         this.healthOffset.width,
         this.healthOffset.height
      );

      this.flashFrame++;

      if(this.flashFrame > this.flashingSpeed) {

         // Normal Bar
         this.drawHUD_BaseBar(
            healthRatio,
            5, 327, 729, 45,
            this.healthOffset.x,
            this.healthOffset.y,
            this.healthOffset.width,
            this.healthOffset.height
         );
      }

      if(this.flashFrame > this.flashingSpeed *2) this.flashFrame = 0;
   }
}

const HUD_DrawEnergy = () => {
   
   let energyRatio = this.updatePlayer.energy / this.initPlayer.baseEnergy;

   // Yellow Bar
   this.drawHUD_BaseBar(
      energyRatio,
      6, 582, 460, 46,
      82, 65, 165, 8
   );
}
