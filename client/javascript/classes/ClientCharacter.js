
"use strict"

class Character {
   constructor() {
      this.floatTextArray = [];
      this.fluidBarArray = [];
      this.clientFrameRate = Math.floor(1000/60);
   }

   removeIndex(array, item) {
      let index = array.indexOf(item);
      array.splice(index, 1);
      index--;
   }
   
   circle_toCircle(first, second, offsetX, offsetY, radius) {
      
      let distX = second.x - (first.x + offsetX);
      let distY = second.y - (first.y + offsetY);
      let distance = Math.sqrt(distX * distX + distY * distY);
      let sumRadius = radius + second.radius;
   
      if(distance <= sumRadius) return true;
   }
   
   drawFloatingText() {

      this.floatTextArray.forEach(text => {
         text.drawText();
         if(text.displayDuration <= 0) this.removeIndex(this.floatTextArray, text);
      });
   }

   drawFluidBar() {
      this.fluidBarArray.forEach(fluidBar => {
         
         if(fluidBar.stateStr === "getFame") fluidBar.getFameFluid();
         if(fluidBar.stateStr === "looseFame") fluidBar.looseFameFluid();

         if(fluidBar.fameDuration <= 0) this.removeIndex(this.fluidBarArray, fluidBar);
      });
   }
}