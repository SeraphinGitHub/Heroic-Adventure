
"use strict"

class Character {
   constructor() {
      this.floatTextArray = [];
      this.fluidBarList = {};
      this.clientFrameRate = 1000/60;
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

      for(let i in this.fluidBarList) {
         let fluidBar = this.fluidBarList[i];

         if(fluidBar.stateStr === "getFame") fluidBar.getFameFluid();
         if(fluidBar.stateStr === "looseFame") fluidBar.looseFameFluid();
      }
   }
}