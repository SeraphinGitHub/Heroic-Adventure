import "./App.css"
import ClientHandler from "./Scripts/_ClientHandler"
import Panel from "./Components/Panel/panel"
import Stats from "./Components/Panel/Contents/Stats/stats"

const App = () => {

   ClientHandler.init();
   
   return(<>
      <Panel
         name        ="Stats"
         translate   ="-10%, -10%"
         scale       ="65%, 65%"
         showCorners ={true}
         content     ={<Stats/>}
      />
   </>);
}

export default App
