
import {
   INumber,
   ISquare,
   ICircle,
   IPosition,
   ILine,
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
      first:  IPosition | ISquare | ICircle,
      second: IPosition | ISquare | ICircle,
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
      square: ISquare,
      circle: ICircle,
   ): boolean {

      const circ: INumber = {
         top:    circle.y -circle.radius,
         right:  circle.x +circle.radius,
         bottom: circle.y +circle.radius,
         left:   circle.x -circle.radius,
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
      first:  ICircle,
      second: ICircle,
   ): boolean {

      const distance    = this.calcDist(first, second);
      const minDistance = first.radius +second.radius;

      const isOverLaping: boolean =
         distance <= minDistance
      ;

      return this.checkIf(isOverLaping);
   }

}