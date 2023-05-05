import PlateSection from "../../PlateSection/plateSection"
import StyleVar     from "../../../../StyleVar";

/* Props:
   
*/

const Template = () => {

   const statsData = [
      {
         title: "Health",
         plateColor:   StyleVar.plate.green,
         isUp:   true,
         isDown: false,
         statsPair: [
            ["Current Health", 566],
            ["Max Health",     3000],
            ["Bonus Health", `+ ${250}`],
            ["Health Regen", `${50}/s`],
         ],
      },

      {
         title: "Mana",
         plateColor:  StyleVar.plate.blue,
         isUp:   false,
         isDown: true,
         statsPair: [
            ["Current Mana", 758],
            ["Max Mana",     2200],
            ["Bonus Mana", `+ ${0}`],
            ["Mana Regen", `${70}/s`],
         ],
      },

      {
         title: "Energy",
         plateColor:  StyleVar.plate.yellow,
         isUp:   true,
         isDown: false,
         statsPair: [
            ["Current Energy", 1780],
            ["Max Energy",     3500],
            ["Bonus Energy", `+ ${500}`],
            ["Energy Regen", `${90}/s`],
         ],
      },

      {
         title: "Attack",
         plateColor:  StyleVar.plate.orange,
         isUp:   false,
         isDown: true,
         statsPair: [
            ["Attack Speed",  `${0.6}s`],
            ["Damages",       `${270} - ${420}`],
            ["Bonus Damages", `+ ${0}`],
         ],
      },

      {
         title: "Movements",
         plateColor:  StyleVar.plate.violet,
         isUp:   false,
         isDown: false,
         statsPair: [
            ["Walk Speed",  `${100}%`],
            ["Run Speed",   `${200}%`],
            ["Bonus Speed", `+ ${0}`],
         ],
      },
   ];

   return(<>
   {statsData.map(section => (
      <PlateSection
         key        ={section.title}
         title      ={section.title}
         plateColor ={section.plateColor}
         isUp       ={section.isUp}
         isDown     ={section.isDown}
         data       ={section.statsPair}
      />
   ))}
   </>);
}

export default Template;