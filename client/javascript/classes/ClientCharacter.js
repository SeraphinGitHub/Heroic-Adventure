
"use strict"

class Character {
   constructor() {
      this.floatTextArray = [];
      this.fluidBarList = {};
   }

   removeIndex(array, item) {
      let index = array.indexOf(item);
      array.splice(index, 1);
      index--;
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