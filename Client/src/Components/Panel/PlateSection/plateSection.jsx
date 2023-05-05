import "./plateSection.css"
import { useRef } from "react";
import StyleVar   from "../../../StyleVar";
import Plate      from "../Plate/plate";

/* Props:
   * title      => String
   * plateColor => String
   * isUp       => Boolean
   * isDown     => Boolean
   * data       => Array
*/

const Template = (props) => {
   
   const sectionRef = useRef(null);
   const listRef    = useRef(null);

   const defaultColor = StyleVar.text.white;
   let valueColor;
   let tempColor;

   const plateStyle = [
      {
         title:     "Name",
         color:     StyleVar.plate.red,
         trans:     "-36%, -15%",
         scale:     "81%, 70%",
         textScale: "110%, 100%",
      },
      
      {
         title:     "Value",
         color:     StyleVar.plate.grey,
         trans:     "79%, -15%",
         scale:     "54%, 70%",
         textScale: "160%, 100%",
      },
   ];

   const reduceSection = (trigger) => {

      if(trigger) {
         listRef.current.classList.add("hideList");
         sectionRef.current.classList.add("hideSection");
      }

      else {
         listRef.current.classList.remove("hideList");
         sectionRef.current.classList.remove("hideSection");
      }
   }

   const updateStatColor = (plateIndex, statIndex) => {

      // If plate is value plate
      return plateIndex === 1 && (
               
         // If stat is 2nd stat
         statIndex === 1 && (
            props.isUp   && !props.isDown ? tempColor = StyleVar.text.green
           :props.isDown && !props.isUp   ? tempColor = StyleVar.text.red
           :tempColor  = defaultColor
         )? valueColor = tempColor

         // If stat is 3rd stat
         :statIndex === 2
         ? valueColor = StyleVar.text.blue
         : valueColor = defaultColor

      )? valueColor = valueColor
      :  valueColor = defaultColor
   }

   return(<>
      <div className={`Flex plateSection`}>

         {props.title &&
            <Plate
               value       ={props.title}
               scale       ={plateStyle[0].scale}
               color       ={props.plateColor}
               textScale   ={plateStyle[0].textScale}
               textColor   ={StyleVar.text.white}
               frameColor  ={StyleVar.frame.gold}
               isUnsetPos  ={true}
               isClickable ={true}
               callback    ={(trigger) => reduceSection(trigger)}
            />
         }

         <div ref={sectionRef} className={`Flex plateList`}>
         <ul  ref={listRef}    className={`Flex`}>
         {props.data.map((statsPair, statIndex) => (

            <li key={statsPair[0]} className={`Flex`}>
            {plateStyle.map((plate, plateIndex) => (

               updateStatColor(plateIndex, statIndex),

               <Plate
                  key        ={plate.title}
                  value      ={statsPair[plateIndex]}
                  translate  ={plate.trans}
                  scale      ={plate.scale}
                  color      ={plate.color}
                  textScale  ={plate.textScale}
                  textColor  ={valueColor}
                  frameColor ={StyleVar.frame.gold}
               />
            ))}
            </li>
         ))}
         </ul>
         </div>
         
      </div>
   </>);
}

export default Template;