
"use strict"

class Character {
   constructor() {
      this.floatTextArray = [];
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
}