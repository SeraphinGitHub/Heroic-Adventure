
import {
   INumber,
   ISquare,
   IPosition,
} from "../utils/interfaces";

// =====================================================================
// Colision Class
// =====================================================================
export class CollisionClass {
   
   checkIf(
      isOverLaping: boolean,
   ): boolean {

      if(isOverLaping) return true;
      return false;
   }

   calcDist(
      first:  IPosition | ISquare,
      second: IPosition | ISquare,
   ): number {

      const distX = second.x -first.x;
      const distY = second.y -first.y;

      return Math.floor( Math.hypot(distX, distY) );
   }
   
   Sqr_Sqr(
      first:  ISquare,
      second: ISquare,
   ): boolean {

      const isOverLaping: boolean =
         !(first.x > second.x + second.width
         ||first.y > second.y + second.height
         ||first.x + first.width  < second.x
         ||first.y + first.height < second.y)
      ;

      return this.checkIf(isOverLaping);
   }

   Sqr_Circ(
      square:    ISquare,
      circlePos: IPosition,
      circleRad: number,
   ): boolean {

      const circ: INumber = {
         top:    circlePos.y -circleRad,
         right:  circlePos.x +circleRad,
         bottom: circlePos.y +circleRad,
         left:   circlePos.x -circleRad,
      }

      const sqr: INumber = {
         top:    square.y,
         right:  square.x +square.width,
         bottom: square.y +square.height,
         left:   square.x,
      }
      
      const isOverLaping: boolean =
            circ.bottom > sqr.top
         && circ.left   < sqr.right
         && circ.top    < sqr.bottom
         && circ.right  > sqr.left
      ;

      return this.checkIf(isOverLaping);
   }

   Circ_Circ(
      firstPos:  IPosition,
      firstRad:  number,
      secondPos: IPosition,
      secondRad: number,
   ): boolean {

      const distance    = this.calcDist(firstPos, secondPos);
      const minDistance = firstRad +secondRad;

      const isOverLaping: boolean =
         distance <= minDistance
      ;

      return this.checkIf(isOverLaping);
   }

}