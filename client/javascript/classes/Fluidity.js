
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
      this.calcMiniWidth = 0;
      this.origin_X = 0;
      this.fluidDuration = bar.fluidDuration;
   }
   

   // =====================================================================
   // Fame Bar
   // =====================================================================
   calcFameFluid(fameCost) {

      const fullBarWidth = this.width - (65 *this.bar.fameScale_X);
      const miniBarWidth = Math.floor(this.bar.fameCost /this.bar.baseFame *fullBarWidth);      
      this.calcMiniWidth = Math.floor((this.bar.fameFluidValue /this.bar.fameCost) *miniBarWidth);

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
         this.calcMiniWidth = 0;
         this.bar.fameFluidValue = 0;
         this.bar.isFameReseted = true;
      }
   }

   getFameFluid() { // ==> FameCost already added to fame
      
      const initialFame = this.bar.fame -this.bar.fameCost;
      const fameEdge = this.bar.baseFame *this.bar.fameCount;
      
      const secondPart_FameCost = this.bar.fame - (this.bar.baseFame *this.bar.fameCount);
      const firstPart_FameCost = this.bar.fameCost -secondPart_FameCost;
      
      // Fame within FameBar
      if(initialFame >= fameEdge) this.calcFameFluid(this.bar.fameCost);

      // Fame over FameBar
      else {
         if(!this.bar.isFameReseted) this.calcFameFluid(firstPart_FameCost); // Render first Part
         else this.calcFameFluid(secondPart_FameCost); // Render second Part
      }    

      this.ctx.drawImage(
         this.img,
         552, 477, 26, 48,
         this.x + (32 *this.bar.fameScale_X) +this.origin_X,
         this.y +19,
         this.calcMiniWidth,
         this.height - 27
      );

      // AnimTimeOut before remove from array
      if(this.fluidDuration > 0) this.fluidDuration --;
   }

   looseFameFluid() {

      let origin_X = 0;

      let fullBarWidth = this.bar.width - (65 *this.bar.fameScale_X);
      let miniBarWidth = Math.floor(this.bar.fameCost /this.bar.baseFame *fullBarWidth);
      let calcMiniWidth = Math.floor((this.bar.fameFluidValue /this.bar.fameCost) *miniBarWidth);
      
      if(calcMiniWidth <= 0) calcMiniWidth = 0;
      if(this.bar.fameFluidValue > 0) this.bar.fameFluidValue -= this.fluidSpeed;

      if(this.bar.fameFluidValue <= 0) {
         this.bar.fameFluidValue = 0;
         calcMiniWidth = 0;
      }
      
      origin_X = this.bar.fameValue /this.bar.baseFame *fullBarWidth;
      
      this.ctx.drawImage(
         this.img,
         552, 529, 26, 48,
         this.bar.x + (32 * this.bar.fameScale_X) +origin_X,
         this.bar.y +19,
         calcMiniWidth,
         this.bar.height - 27
      );
   }
}