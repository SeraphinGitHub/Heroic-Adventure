
import {
   IAuthSocket,
} from "../utils/interfaces";

import { PlayerClass }     from "./Player";
import { startController } from "../API/players/socketControllers"
import { appServer }       from "../_Server";
import { Server, Socket }  from "socket.io";
import jwt                 from "jsonwebtoken";
import dotenv              from "dotenv";
dotenv.config();


// =====================================================================
// Game Handler Class
// =====================================================================
export class GameHandlerClass {

   socketsMap: Map<number, Socket>      = new Map<number, Socket>();
   playersMap: Map<number, PlayerClass> = new Map<number, PlayerClass>();
   // initPlayersMap: Map<number, PlayerClass> = new Map<number, PlayerClass>();
   // mobsMap:    Map<number, MobClass>    = new Map<number, MobClass>();
   // initMobsMap:    Map<number, MobClass>    = new Map<number, MobClass>();


   start() {
      const socketIO: Server = new Server(appServer);

      socketIO.on("connection", (socket) => {
      
         this.connectPlayer(socket);
         this.disconnectPlayer(socket);
      });
   }
   
   connectPlayer(socket: Socket) {
      console.log("Player Connected");

      socket.on("auth", async (data: IAuthSocket) =>  {
         const { playerName, playerToken, userToken }: IAuthSocket = data;

         try {
            const { id: playerID }: any = jwt.verify(playerToken, process.env.SECURITY_TOKEN!);
            const { id: userID   }: any = jwt.verify(userToken,   process.env.SECURITY_TOKEN!);

            if(typeof playerID !== "number"
            || typeof userID   !== "number") {
               throw new Error;
            }
            
            const Player: PlayerClass = new PlayerClass({ playerName, userID });
            await Player.syncWithDB();
            
            if(playerID !== Player.id) throw new Error;
            
            this.socketsMap.set(playerID, socket);
            this.playersMap.set(playerID, Player);

            // initPlayersList[playerID] = player.initPack();
            
            // socket.emit("authSucces", playerID);
   
            startController(socket, Player)
   
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
   
   disconnectPlayer(socket: Socket) {
      socket.on("disconnect", () => {
   
         console.log("Player disconnected");
      });
   }
}