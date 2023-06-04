
import {
   IAuthSocket,
} from "../utils/interfaces";

import { PlayerClass }     from "./_Export";
import { startController } from "../API/players/socketControllers"
import { appServer }       from "../_Server";
import { Server, Socket }  from "socket.io";
import jwt                 from "jsonwebtoken";
import dotenv              from "dotenv";
dotenv.config();


// =====================================================================
// Manager Class
// =====================================================================
export class ManagerClass {

   socketIO:       Server = new Server(appServer);

   static socketsMap: Map<number, Socket>      = new Map<number, Socket>();
   static playersMap: Map<number, PlayerClass> = new Map<number, PlayerClass>();
   // initPlayersMap: Map<number, PlayerClass> = new Map<number, PlayerClass>();
   // mobsMap:        Map<number, MobClass>    = new Map<number, MobClass>();
   // initMobsMap:    Map<number, MobClass>    = new Map<number, MobClass>();

   syncRate: number = Math.floor(1000 / Number(process.env.FRAME_RATE));

   start() {
      this.socketIO.on("connection", (socket) => {
      
         this.connectPlayer(socket);
         this.disconnectPlayer(socket);
      });
   }
   
   connectPlayer(socket: any) {
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
            
            socket.id = playerID;

            ManagerClass.socketsMap.set(playerID, socket);
            ManagerClass.playersMap.set(playerID, Player);
            // this.initPlayersMap.set(playerID, Player.initPack());


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
   
   disconnectPlayer(socket: any) {
      socket.on("disconnect", () => {
   
         const playerID: number = socket.id;
         
         if(ManagerClass.socketsMap.get(playerID) === undefined
         || ManagerClass.playersMap.get(playerID) === undefined) {
            return;
         }
         
         // let initPack = initPlayersList[playerID];
         // this.socketIO.emit("removePlayer", initPack);
         
         // this.initPlayersMap.delete(playerID);
         ManagerClass.playersMap.delete(playerID);
         ManagerClass.socketsMap.delete(playerID);
         
         console.log("Player disconnected");
      });
   }


   cyclePlayersMap(callback: Function) {

      ManagerClass.playersMap.forEach((player, playerID) => {
         const socket: unknown = ManagerClass.socketsMap.get(playerID);
         callback(socket, player, playerID);
      });
   }

   updateAll_Mobs() {

      // this.mobsMap.forEach((mob, mobID) => {

      //    const mobLightPack = mob.update();

      //    cyclePlayersMap((socket, player, playerID) => {
            
      //       player.enterViewport(mob, socket, () => {
      //          if(!player.detectMobsList[mobId])    player.detectMobsList[mobId]    = mob;
      //          if(!player.renderMobsList[mobId])    player.renderMobsList[mobId]    = mobLightPack;
      //          if(!mob.detectPlayersList[playerID]) mob.detectPlayersList[playerID] = player;
      //          if(!mob.detectSocketList [playerID]) mob.detectSocketList [playerID] = socket;

      //       }, () => {
      //          if(player.detectMobsList[mobId])    delete player.detectMobsList[mobId];
      //          if(player.renderMobsList[mobId])    delete player.renderMobsList[mobId];
      //          if(mob.detectPlayersList[playerID]) delete mob.detectPlayersList[playerID];
      //          if(mob.detectSocketList [playerID]) delete mob.detectSocketList [playerID];
      //       });
      //    });
      // });
   }

   updateAll_Players() {

      // cyclePlayersMap((socket, player, playerID) => {

      //    player.update(socketList);

      //    cyclePlayersMap((unSocket, unPlayer, otherPlayerID) => {
      //       if(playerID !== otherPlayerID) {
      //          let otherPlayer = playersList[playerID];

      //          player.enterViewport(otherPlayer, socket, () => {
      //             if(!player.detectPlayersList[playerID]) player.detectPlayersList[playerID] = otherPlayer;
      //             if(!player.renderPlayersList[playerID]) player.renderPlayersList[playerID] = otherPlayer.lightPack();

      //          }, () => {
      //             if(player.detectPlayersList[playerID]) delete player.detectPlayersList[playerID];
      //             if(player.renderPlayersList[playerID]) delete player.renderPlayersList[playerID];
      //          });
      //       }
      //    });
      // });
   }


   sendSyncPack() {
      // ===================================
      // Sending Light Packs
      // ( Update: Enemies, Players, NPCs only inside Client viewport )
      // ===================================

      // this.cyclePlayersMap((socket, player) => {
      //    socket.emit("serverSync", player.renderPlayersList, player.renderMobsList);

      //    player.renderPlayersList = {};
      //    player.renderMobsList    = {};
      // });
   }

   sync() {

      // setInterval(() => {
         
   
      //    this.updateAll_Mobs();
      //    this.updateAll_Players();
   
      //    this.sendSyncPack();
   
      // }, this.syncRate);
   }
}