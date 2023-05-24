
import {
   IString,
} from "../../utils/interfaces";

import {
   handleZodError,
} from "../users/auth";

import { Request, Response } from "express";
import { Server }            from "socket.io";
import { nameReg }           from "../../utils/regex";
import { DBexecute }         from "../../DB/DataBase";
import { server }            from "../../_Server";
import { z }                 from "zod";

import { PlayerClassTest } from "../../classes/playerClassTest";

const pNameMin: number = 4;
const pNameMax: number = 12;


// =====================================================================
// Create Player ==> POST
// =====================================================================
export const createPlayer = async (
   req: Request,
   res: Response,
) => {

   const schema = z.object({
      playerName: z.string().min(pNameMin).max(pNameMax).regex(nameReg),
   });
   
   const result = schema.safeParse(req.body);
   if(!result.success) return handleZodError(res, result);
   
   const { playerName }: IString = result.data;
   
   try {
      // **********  Check name vacancy  **********
      const { DB_Count: playerExist }: any = await DBexecute(__dirname, "CheckNameVacancy", { playerName });
      
      if(playerExist === 1) {
         return res.status(500).json({ message: `This player name is unavailable !` });
      }
      
      // **********  Create player & save to DB  **********
      const newPlayer: PlayerClassTest = new PlayerClassTest(playerName);
      // ****
      // ==> Change with REAL player Class when recast !
      // ****

      const data = {
         userID: res.locals.userID,
         name:   playerName,
         ...newPlayer.export(),
      }

      const { DB_Count, DB_GetOne}: any = await DBexecute(__dirname, "CreatePlayer", data);

      if(DB_Count === 1) {
         newPlayer.id = DB_GetOne.id;
         res.status(200).json({ message: `New charachter created ! ${ newPlayer.name }`});
      }
   }
   
   catch {
      res.status(500).json({ message: `Could not create character !`});
   }
}


// =====================================================================
// Player Page ==> GET
// =====================================================================
export const playerPage = async (
   req: Request,
   res: Response,
) => {
   
   try {
      const userID: number = res.locals.userID;
      const { DB_Count, DB_GetAll }: any = await DBexecute(__dirname, "GetAllPlayers_ByUserID", { userID });
      
      let message: string = "Success";
      if(DB_Count === 0) message = "No character found !";

      res.send({ data: DB_GetAll, message });
   }
   
   catch {
      res.status(500).json({ message: `Could not load characters page !`});
   }
}


// =====================================================================
// Enter World ==> GET
// =====================================================================
export const enterWorld = async (
   req: Request,
   res: Response,
) => {
   
   const socketIO = new Server(server);
   
   socketIO.on("connection", (socket) => {
      console.log("User Connected with Socket.io")
      
      socket.on("disconnect", () => {
         console.log("Disconnected from Socket.io")
      });
   });

   // socket.on("authCheck", (authPackage) =>  {
   //    if(authPackage.token === process.env.SECURITY_TOKEN) {
         
   //       playerID++;
   //       socket.id    = playerID;
   //       const player = new PlayerClass(playerID, authPackage.playerName);
         
   //       socketList     [playerID] = socket;
   //       playersList    [playerID] = player;
   //       initPlayersList[playerID] = player.initPack();
         
   //       socket.emit("authSucces", playerID);
   //       playerHandler.run(socket, player);

   //       socket.emit("initMobs", initMobsList);
   //       socketIO.emit("initPlayers", initPlayersList);

   //       // console.log("User connected !");
   //    }
   //    else socket.emit("authFail", "Authentification Failed !");
   // });  

   try {
      res.status(200).json({ message: `Entered world !`});
   }

   catch {
      res.status(500).json({ message: `Could not enter world !`});
   }
}