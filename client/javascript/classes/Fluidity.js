
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
   }
   
   getFameFluid() {

      let origin_X = 0;

      let fullBarWidth = this.barSpecs.width - (65 *this.barSpecs.fameScale_X);
      let miniBarWidth = Math.floor(this.barSpecs.fameCost /this.barSpecs.baseFame *fullBarWidth);
      let calcWidth = Math.floor((this.barSpecs.fameFluidValue /this.barSpecs.fameCost) *miniBarWidth);
      
      if(calcWidth <= 0) calcWidth = 0;

      if(this.barSpecs.fameFluidValue < this.barSpecs.fameCost) this.barSpecs.fameFluidValue += this.fluidSpeed;
      if(this.barSpecs.fameFluidValue > this.barSpecs.fameCost) this.barSpecs.fameFluidValue = this.barSpecs.fameCost;
      if(this.barSpecs.fameFluidValue === this.barSpecs.fameCost) calcWidth = 0;

      origin_X = this.barSpecs.fameValue /this.barSpecs.baseFame *fullBarWidth;
      
      this.ctx.drawImage(
         this.img,
         552, 477, 26, 48,
         this.barSpecs.x + (32 * this.barSpecs.fameScale_X) +origin_X,
         this.barSpecs.y +19,
         calcWidth,
         this.barSpecs.height - 27
      );      
   }

   looseFameFluid() {

      let origin_X = 0;

      let fullBarWidth = this.barSpecs.width - (65 *this.barSpecs.fameScale_X);
      let miniBarWidth = Math.floor(this.barSpecs.fameCost /this.barSpecs.baseFame *fullBarWidth);
      let calcWidth = Math.floor((this.barSpecs.fameFluidValue /this.barSpecs.fameCost) *miniBarWidth);
      
      if(calcWidth <= 0) calcWidth = 0;
      if(this.barSpecs.fameFluidValue > 0) this.barSpecs.fameFluidValue -= this.fluidSpeed;

      if(this.barSpecs.fameFluidValue <= 0) {
         this.barSpecs.fameFluidValue = 0;
         calcWidth = 0;
      }
      
      origin_X = this.barSpecs.fameValue /this.barSpecs.baseFame *fullBarWidth;
      
      this.ctx.drawImage(
         this.img,
         552, 529, 26, 48,
         this.barSpecs.x + (32 * this.barSpecs.fameScale_X) +origin_X,
         this.barSpecs.y +19,
         calcWidth,
         this.barSpecs.height - 27
      );
   }
}