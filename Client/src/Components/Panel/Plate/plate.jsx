import "./plate.css";
import { useState } from "react";
import PlateColor from "./PlateColor/plateColor";

/* Props:
   * value       => String || Number
   * translate   => String
   * scale       => String
   * color       => String
   * textScale   => String
   * textColor   => String
   * frameColor  => String
   * isUnsetPos  => Boolean
   * isClickable => Boolean
   * callback    => Function
*/

const Template = (props) => {

   let clickPlate   = "";
   let clickHandler = null;
   const [trigger, setTrigger] = useState(false);
   
   if(props.isClickable) {
      clickPlate = "clickPlate";
      
      if(props.callback) clickHandler = () => {
         setTrigger(!trigger);
         props.callback(!trigger);
      }
   }

   const style = {
      plate: {
         transform:
            props.scale && props.translate
            ?`scale(${props.scale}) translate(${props.translate})`
            : props.scale? `scale(${props.scale})`
            : props.translate? `translate(${props.translate})`
            : ""
         ,

         position:  props.isUnsetPos? "unset" :"absolute",
      },

      text: {
         color: `${props.textColor}`,
         transform: `scale(${props.textScale})`,
      }
   }
   
   return(<>
      <button onClick={clickHandler} style={style.plate} className={`Flex plate ${clickPlate}`}>
         <div className={`Flex Img frame ${props.frameColor}`}>

            <PlateColor color={props.color}/>
            <p style={style.text} className={`Flex`}>{props.value}</p>
            
         </div>
      </button>
   </>);
}

export default Template;