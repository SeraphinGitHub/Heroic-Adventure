
import jwt        from "jsonwebtoken";
import dotenv     from "dotenv";
dotenv.config();


export const connectPlayer = (socket: any) => {
   console.log("Player Connected");
   
   socket.on("auth", (playerToken: string) =>  {

      try {
         const { id: playerID }: any = jwt.verify(playerToken, process.env.SECURITY_TOKEN!);
         if(typeof playerID !== "number") throw new Error;
         
         socket.id    = playerID;

         // const player = new PlayerClass(playerID, authPackage.playerName);
         
         // socketList     [playerID] = socket;
         // playersList    [playerID] = player;
         // initPlayersList[playerID] = player.initPack();
         
         // socket.emit("authSucces", playerID);



         // playerHandler.run(socket, player);


         // socket.emit("initMobs", initMobsList);
         // socketIO.emit("initPlayers", initPlayersList);
         

         
         socket.emit("authSuccess", "Authenticated successfully !");
         console.log("Player authenticated !");
      }

      catch {
         socket.emit("authFailed", "Authentification Failed !");
      }
   });
}

export const disconnectPlayer = (socket: any) => {
   
   socket.on("disconnect", () => {

      console.log("Player disconnected");

   });
}