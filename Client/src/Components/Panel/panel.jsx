import "./panel.css";
import StyleVar   from "../../StyleVar";
import PaperSheet from "./PaperSheet/paperSheet";
import Plate      from "./Plate/plate";

/* Props:
   * name        => String
   * tanslate    => String
   * scale       => String
   * showPaper   => Boolean
   * showCorners => Boolean
   * content     => Component
*/

const Template = (props) => {

   const style = {
      panel: {
         transform:
            props.scale && props.tanslate
            ?`scale(${props.scale}) translate(${props.tanslate})`
            : props.scale? `scale(${props.scale})`
            : props.tanslate? `translate(${props.tanslate})`
            : ""
         ,
      },
   }

   return(<>
      <section style={style.panel} className={`Flex Img panel`}>

         {/* Toggle Paper */}
         {props.showPaper &&
            <PaperSheet/>
         }


         {/* Toggle Corners */}
         {props.showCorners &&
            <div className={`Flex corners`}>
               <div className={`Img ${StyleVar.panelCorner.silver}`}/>
               <div className={`Img ${StyleVar.panelCorner.silver}`}/>
               <div className={`Img ${StyleVar.panelCorner.silver}`}/>
               <div className={`Img ${StyleVar.panelCorner.silver}`}/>
            </div>
         }
         

         {/* Panel Name */}
         {props.name &&
            <Plate
               value       ={props.name}
               translate   ="0%, -60%"
               scale       ="95%, 90%"
               color       ={StyleVar.plate.blue}
               textScale   ="130%, 100%"
               textColor   ={StyleVar.text.yellow}
               frameColor  ={StyleVar.frame.gold}
               isClickable ={true}
            />
         }
         

         {/* Panel Content */}
         <div className={`Flex content`}>
            {props.content}
         </div>

      </section>
   </>);
}

export default Template;