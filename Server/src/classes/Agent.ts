
import {
   INumber,
} from "../utils/interfaces";


// =====================================================================
// Agent Class
// =====================================================================
export class AgentClass {

   constructor() {
      
   }

   RnG(
      stat:  number,
      coeff: number,
   ) {
      return stat + Math.floor( Math.random() * (stat *coeff) );
   }
   
}