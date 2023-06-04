
import {
   INumber,
} from "../utils/interfaces";

import {
   CollisionClass,
} from "./_Export";


// =====================================================================
// Agent Class
// =====================================================================
export class AgentClass extends CollisionClass {

   constructor() {
      super();
   }

   RnG(
      stat:  number,
      coeff: number,
   ) {
      return stat + Math.floor( Math.random() * (stat *coeff) );
   }
   
}