
"use strict"

// =====================================================================
// Fluidity Game Bar
// =====================================================================
class Fluidity {
   constructor(ctx, img, bar) {
      
      this.ctx = ctx;
      this.img = img;
      this.bar = bar;
      
      // Position
      this.x = bar.x;
      this.y = bar.y;
      this.width = bar.width;
      this.height = bar.height;

      // Specs
      this.stateStr = bar.stateStr;
      this.fluidSpeed = bar.fluidSpeed;
      this.fluidDuration = Math.floor(bar.calcStat /bar.fluidSpeed);
      this.origin_X = 0;
      this.fullBarWidth;
      this.miniBarWidth;
      this.statRatio;
      this.calcStatRatio;
      this.fluidWidth;
   }

   calcMiniWidth() {

      this.statRatio = this.bar.stat /this.bar.baseStat;
      this.calcStatRatio = this.bar.calcStat /this.bar.baseStat;

      this.fullBarWidth = this.width - (this.bar.off_W *this.bar.scale_X);
      this.miniBarWidth = Math.floor(this.calcStatRatio *this.fullBarWidth);      
      this.fluidWidth = Math.floor((this.bar.statFluidValue /this.bar.calcStat) *this.miniBarWidth);
   }

   animTimeOut() {

      // TimeOut before remove from array
      if(this.fluidDuration > 0) this.fluidDuration --;
   }
   

   // =====================================================================
   // Fame Bar
   // =====================================================================
   getFame_OriginX(fameCost) {
      
      this.calcMiniWidth();

      // Mini Bar is rendering first
      if(this.bar.statFluidValue !== fameCost) {
         if(this.bar.statFluidValue < fameCost) this.bar.statFluidValue += this.fluidSpeed;
         if(this.bar.statFluidValue > fameCost) this.bar.statFluidValue = fameCost;

         // Mini Bar within FameBar
         if(!this.bar.isFameReseted) this.origin_X = this.statRatio *this.fullBarWidth;
         
         // Mini Bar over FameBar
         else this.origin_X = 0;
      }

      // Mini Bar reset in order to render second
      else if(!this.bar.isFameReseted) {
         this.fluidWidth = 0;
         this.bar.statFluidValue = 0;
         this.bar.isFameReseted = true;
      }
   }
   
   drawFameFluid(sX, sY, sW, sH) {
      this.ctx.drawImage(
         this.img,
         sX ,sY, sW, sH,
         this.bar.x + (32 * this.bar.scale_X) +this.origin_X,
         this.bar.y +19,
         this.fluidWidth,
         this.bar.height - 27
      );
   }

   // Get Fame
   getFameFluid() {
      
      // ==> Already include fameCost <==

      const initialFame = this.bar.fame -this.bar.calcStat;
      const fameEdge = this.bar.baseStat *this.bar.fameCount;
      
      const secondPart_FameCost = this.bar.fame - (this.bar.baseStat *this.bar.fameCount);
      const firstPart_FameCost = this.bar.calcStat -secondPart_FameCost;
      
      // Fame within FameBar
      if(initialFame >= fameEdge) this.getFame_OriginX(this.bar.calcStat);

      // Fame over FameBar
      else {
         if(!this.bar.isFameReseted) this.getFame_OriginX(firstPart_FameCost); // Render first Part
         else this.getFame_OriginX(secondPart_FameCost); // Render second Part
      }    

      this.drawFameFluid(552, 477, 26, 48);
      this.animTimeOut();
   }
   
   // Loose Fame
   looseFameFluid() {

      // ==> Already removed fameCost <==

      this.calcMiniWidth();

      if(this.fluidWidth <= 0) this.fluidWidth = 0;
      if(this.bar.statFluidValue > 0) this.bar.statFluidValue -= this.fluidSpeed;

      if(this.bar.statFluidValue <= 0) {
         this.bar.statFluidValue = 0;
         this.fluidWidth = 0;
      }

      this.origin_X = this.statRatio *this.fullBarWidth;

      this.drawFameFluid(552, 529, 26, 48);
      this.animTimeOut();
   }
   

   // =====================================================================
   // HUD Bar
   // =====================================================================
   getHUD_OriginX(sX, sY, sW, sH, modifier) {

      this.calcMiniWidth();

      if(this.bar.statFluidValue > 0) this.bar.statFluidValue -= this.fluidSpeed;
      else this.bar.statFluidValue = 0;

      this.origin_X = this.statRatio *this.fullBarWidth

      this.drawHUD_Fluid(sX, sY, sW, sH, modifier);
      this.animTimeOut();
   }

   drawHUD_Fluid(sX, sY, sW, sH, modifier) {

      const healWidth = sW *(this.bar.statFluidValue /this.bar.baseStat);
      const start_X = sX + sW *this.statRatio -healWidth/2 + (healWidth/2 *modifier);

      this.ctx.drawImage(
         this.img,
         start_X, sY, healWidth, sH,

         this.bar.x + (this.bar.off_X * this.bar.scale_X) +this.origin_X,
         this.bar.y + (this.bar.off_Y * this.bar.scale_Y),
         this.fluidWidth *modifier,
         this.bar.height/3 - (this.bar.off_H * this.bar.scale_Y)
      );
   }

   // Get Health
   getHealthFluid() {

      const modifier = -1;
      this.getHUD_OriginX(6, 376, 729, 45, modifier);
   }

   // Loose Health
   looseHealthFluid() {

      const modifier = 1;
      this.getHUD_OriginX(6, 424, 729, 45, modifier);
   }
   
   // Loose Mana
   looseManaFluid() {

      const modifier = 1;
      this.getHUD_OriginX(521, 580, 460, 47, modifier);
   }
}