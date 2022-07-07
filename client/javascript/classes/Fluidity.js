
"use strict"

// =====================================================================
// Fluidity Game Bar
// =====================================================================
class Fluidity {
   constructor(ctx, img, bar) {
      
      this.ctx = ctx;
      this.img = img;
      this.bar = bar;

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

      this.fullBarWidth = this.bar.position.width - (this.bar.offset.width *this.bar.scaleX);
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
         this.bar.position.x + (this.bar.offset.x * this.bar.scaleX) +this.origin_X,
         this.bar.position.y +this.bar.offset.y,
         this.fluidWidth,
         this.bar.position.height -this.bar.offset.height
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

      this.origin_X = this.statRatio *this.fullBarWidth;
      this.drawHUD_Fluid(sX, sY, sW, sH, modifier);
      this.animTimeOut();
   }

   drawHUD_Fluid(sX, sY, sW, sH, modifier) {

      const healWidth = sW *(this.bar.statFluidValue /this.bar.baseStat);
      const startX = sX + sW *this.statRatio -healWidth/2 + (healWidth/2 *modifier);

      this.ctx.drawImage(
         this.img,
         startX, sY, healWidth, sH,
         this.bar.position.x + (this.bar.offset.x * this.bar.scaleX) +this.origin_X,
         this.bar.position.y + (this.bar.offset.y * this.bar.scaleY),
         this.fluidWidth *modifier,
         this.bar.position.height/3 - (this.bar.offset.height * this.bar.scaleY)
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
      this.getHUD_OriginX(10, 631, 460, 47, modifier);
   }
}