
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
      this.miniWidth = 0;
      this.origin_X = 0;
      this.fluidDuration = bar.fluidDuration;
   }
   
   calcFluid() {

   }

   // =====================================================================
   // Fame Bar
   // =====================================================================
   calcMiniWidth() {

      const fullBarWidth = this.width - (65 *this.bar.fameScale_X);
      const miniBarWidth = Math.floor(this.bar.fameCost /this.bar.baseFame *fullBarWidth);      
      this.miniWidth = Math.floor((this.bar.fameFluidValue /this.bar.fameCost) *miniBarWidth);
      
      return fullBarWidth;
   }

   getFameOriginX(fameCost) {

      const fullBarWidth = this.calcMiniWidth();

      // Mini Bar is rendering first
      if(this.bar.fameFluidValue !== fameCost) {
         if(this.bar.fameFluidValue < fameCost) this.bar.fameFluidValue += this.fluidSpeed;
         if(this.bar.fameFluidValue > fameCost) this.bar.fameFluidValue = fameCost;

         // Mini Bar within FameBar
         if(!this.bar.isFameReseted) this.origin_X = this.bar.fameValue /this.bar.baseFame *fullBarWidth;
         
         // Mini Bar over FameBar
         else this.origin_X = 0;
      }

      // Mini Bar reset in order to render second
      else if(!this.bar.isFameReseted) {
         this.miniWidth = 0;
         this.bar.fameFluidValue = 0;
         this.bar.isFameReseted = true;
      }
   }  

   // Get Fame
   getFameFluid() {
      
      // ==> Already include fameCost <==

      const initialFame = this.bar.fame -this.bar.fameCost;
      const fameEdge = this.bar.baseFame *this.bar.fameCount;
      
      const secondPart_FameCost = this.bar.fame - (this.bar.baseFame *this.bar.fameCount);
      const firstPart_FameCost = this.bar.fameCost -secondPart_FameCost;
      
      // Fame within FameBar
      if(initialFame >= fameEdge) this.getFameOriginX(this.bar.fameCost);

      // Fame over FameBar
      else {
         if(!this.bar.isFameReseted) this.getFameOriginX(firstPart_FameCost); // Render first Part
         else this.getFameOriginX(secondPart_FameCost); // Render second Part
      }    

      this.drawFameFluid(552, 477, 26, 48);
      
      // AnimTimeOut before remove from array
      if(this.fluidDuration > 0) this.fluidDuration --;
   }

   // Loose Fame
   looseFameFluid() {

      // ==> Already removed fameCost <==

      const fullBarWidth = this.calcMiniWidth();

      if(this.miniWidth <= 0) this.miniWidth = 0;
      if(this.bar.fameFluidValue > 0) this.bar.fameFluidValue -= this.fluidSpeed;

      if(this.bar.fameFluidValue <= 0) {
         this.bar.fameFluidValue = 0;
         this.miniWidth = 0;
      }

      this.origin_X = this.bar.fameValue /this.bar.baseFame *fullBarWidth;

      this.drawFameFluid(552, 529, 26, 48);

      // AnimTimeOut before remove from array
      if(this.fluidDuration > 0) this.fluidDuration --;
   }

   // Draw Fame Fluidity
   drawFameFluid(sX, sY, sW, sH) {
      this.ctx.drawImage(
         this.img,
         sX ,sY, sW, sH,
         this.bar.x + (32 * this.bar.fameScale_X) +this.origin_X,
         this.bar.y +19,
         this.miniWidth,
         this.bar.height - 27
      );
   }
}