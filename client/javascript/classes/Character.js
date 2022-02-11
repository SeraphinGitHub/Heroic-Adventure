
"use strict"

class Character {
   constructor() {
      this.floatTextArray = [];
   }

   drawFloatingText() {

      this.floatTextArray.forEach(text => {
         text.drawText();
   
         if(text.displayDuration <= 0) {
            let textIndex = this.floatTextArray.indexOf(text);
            this.floatTextArray.splice(textIndex, 1);
            textIndex--;
         }
      });
   }
}