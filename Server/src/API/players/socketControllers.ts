
import { PlayerClass } from "../../classes/_export";
import { Socket }      from "socket.io";

   
export const startController = (
   socket: Socket,
   player: PlayerClass
) => {

   startControls(socket, player);         
   startChat    (socket);
}


// =====================================================================
// Controls
// =====================================================================
const startControls = (
   socket: Socket,
   player: PlayerClass
) => {

   console.log("--Controls: loaded !"); // ******************************************************

   // // Movements
   // socket.on("up"   , (state) => player.moveAxis.up    = state);
   // socket.on("down" , (state) => player.moveAxis.down  = state);
   // socket.on("left" , (state) => player.moveAxis.left  = state);
   // socket.on("right", (state) => player.moveAxis.right = state);

   // // Spells cast
   // socket.on("heal", (state) => {
   //    player.booleans.isCasting = state;
   //    player.spells.heal.isCast = state;
   // });
   
   // // States
   // socket.on("run"    , (state) => player.booleans.isRunning = state);
   // socket.on("attack" , (state) => player.meleeHitbox.damages.isAttack = state);
}


// =====================================================================
// Chat
// =====================================================================
const startChat = (
   socket: Socket,
) => {
   
   console.log("--Chat: loaded !"); // ******************************************************


   // let receiverID;
   // let receiverName;

   // // ========== General Chat ==========
   // socket.on("generalMessage", (textMessage) => {
      
   //    if(!textMessage.includes("</")) {
   //       Object.values(socketList).forEach((socket) => {
   //          socket.emit("addMessage_General", `${player.name}: ${textMessage}`);
   //       });
   //    }
   // });
   
   // // ========== Private Chat ==========
   // socket.on("privateMessage", (textMessage) => {
   //    const prefix = "To >";
   //    let receiver = socketList[receiverID];
      
   //    if(!textMessage.includes("</")) {

   //       if(receiver) {
   //          receiver.emit("addMessage_Private", `${player.name}: ${textMessage}`);
   //          socket.emit("addMessage_Private", `${prefix}${receiverName}: ${textMessage}`);
   //       }
   //       else socket.emit("addMessage_Private", `>${receiverName}< Has gone offline !`);
   //    }
   // });
   
   // // Get reveiver ID for private chat 
   // socket.on("chatReceiverName", (name) => {
   //    receiverName = name;
      
   //    Object.values(playersList).forEach((receiver) => {
   //       if(receiver.name === name) receiverID = receiver.id;
   //    });
   // });
}
