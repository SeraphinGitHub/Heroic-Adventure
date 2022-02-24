
"use strict"

// =====================================================================
// Fluidity Game Bar
// =====================================================================
class Fluidity {
   constructor(ctx, img, barSpecs) {
      
      this.ctx = ctx;
      this.img = img;
      this.barSpecs = barSpecs;
      this.stateStr = barSpecs.stateStr;
      this.fluidSpeed = barSpecs.fluidSpeed;
      this.calcMiniWidth = 0;
      this.origin_X = 0;

      // Position
      this.x = barSpecs.x;
      this.y = barSpecs.y;
      this.width = barSpecs.width;
      this.height = barSpecs.height;
      
      // Fame Bar
      this.fameScale_X = barSpecs.fameScale_X;
      this.baseFame = barSpecs.baseFame;
      this.fame = barSpecs.fame;
      this.fameValue = barSpecs.fameValue;
      this.fameCount = barSpecs.fameCount;
      this.fameCost = barSpecs.fameCost;
      this.fameFluidValue = barSpecs.fameFluidValue;
      this.isFameReseted = barSpecs.isFameReseted;
      this.fameDuration = barSpecs.fameDuration;
   }
   
   calcFameFluid(fameCost) {

      const fullBarWidth = this.width - (65 *this.fameScale_X);
      const miniBarWidth = Math.floor(this.fameCost /this.baseFame *fullBarWidth);      
      this.calcMiniWidth = Math.floor((this.fameFluidValue /this.fameCost) *miniBarWidth);

      // Mini Bar is Rendering
      if(this.fameFluidValue !== fameCost) {
         if(this.fameFluidValue < fameCost) this.fameFluidValue += this.fluidSpeed;
         if(this.fameFluidValue > fameCost) this.fameFluidValue = fameCost;

         // Mini Bar under FameBar
         if(!this.isFameReseted) this.origin_X = this.fameValue /this.baseFame *fullBarWidth;
         
         // Mini Bar over FameBar
         else this.origin_X = 0;
      }
      
      // Mini Bar is done
      else if(!this.isFameReseted) {
         this.fameFluidValue = 0;
         this.calcMiniWidth = 0;
         this.isFameReseted = true;
      }

      else this.calcMiniWidth = 0;

      // this.fameFluidValue = 0;
      // this.isFameReseted = false;
   }

   getFameFluid() { // ==> FameCost already added to fame

      const secondPart_FameCost = this.fame - (this.baseFame *this.fameCount);
      const firstPart_FameCost = this.fameCost -secondPart_FameCost;

      // FameCost within FameBar
      if(this.fame -this.fameCost <= (this.baseFame *this.fameCount) -this.fameCost) {
         this.calcFameFluid(this.fameCost);
      }

      // FameCost over FameBar
      else {

         // First Part
         if(!this.isFameReseted) this.calcFameFluid(firstPart_FameCost);
         
         // Second Part
         else this.calcFameFluid(secondPart_FameCost);
      }
      
      this.ctx.drawImage(
         this.img,
         552, 477, 26, 48,
         this.x + (32 *this.fameScale_X) +this.origin_X,
         this.y +19,
         this.calcMiniWidth,
         this.height - 27
      );

      if(this.fameDuration > 0) this.fameDuration --;
   }

   looseFameFluid() {

      let origin_X = 0;

      let fullBarWidth = this.barSpecs.width - (65 *this.barSpecs.fameScale_X);
      let miniBarWidth = Math.floor(this.barSpecs.fameCost /this.barSpecs.baseFame *fullBarWidth);
      let calcMiniWidth = Math.floor((this.barSpecs.fameFluidValue /this.barSpecs.fameCost) *miniBarWidth);
      
      if(calcMiniWidth <= 0) calcMiniWidth = 0;
      if(this.barSpecs.fameFluidValue > 0) this.barSpecs.fameFluidValue -= this.fluidSpeed;

      if(this.barSpecs.fameFluidValue <= 0) {
         this.barSpecs.fameFluidValue = 0;
         calcMiniWidth = 0;
      }
      
      origin_X = this.barSpecs.fameValue /this.barSpecs.baseFame *fullBarWidth;
      
      this.ctx.drawImage(
         this.img,
         552, 529, 26, 48,
         this.barSpecs.x + (32 * this.barSpecs.fameScale_X) +origin_X,
         this.barSpecs.y +19,
         calcMiniWidth,
         this.barSpecs.height - 27
      );
   }
}