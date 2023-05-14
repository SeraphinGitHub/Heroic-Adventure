
import {
   IBoolean,
   INumber,
} from "../../utils/interfaces";


// =====================================================================
// NewClass
// =====================================================================
export class PlayerClassTest {

   id:   number | undefined = undefined;
   name: string;

   position:  INumber = { x: 250, y: 450 };
   
   moveSpeed: INumber = {
      walkSpeed: 100,
      runSpeed:  200,
   };

   baseStats: INumber = {
      health: 3000,
      mana:   2500,
      energy: 3300,
   };

   stats:     INumber = {
      health: this.baseStats.health,
      mana:   this.baseStats.mana,
      energy: this.baseStats.energy,
   };

   booleans: IBoolean = {
      isDead:      false,
      isRespawn:   false,
      isAttacking: false,
      isCasting:   false,
   };


   constructor(name: string) {

      this.name = name;
   }

   run() {
      console.log(this.id);
      console.log(this.name);
      console.log(this.stats);
      console.log(this.moveSpeed);
   }

   export() {
      return {
         position:  JSON.stringify(this.position),
         moveSpeed: JSON.stringify(this.moveSpeed),
         baseStats: JSON.stringify(this.baseStats),
         stats:     JSON.stringify(this.stats),
         booleans:  JSON.stringify(this.booleans),
      }
   }
}