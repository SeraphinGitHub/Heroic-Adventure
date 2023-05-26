
import {
   IString,
} from "../../utils/interfaces";

import { NextFunction, Request, Response } from "express";
import { Server }                          from "socket.io";
import { nameReg }                         from "../../utils/regex";
import { DBexecute }                       from "../../DB/DataBase";
import { server }                          from "../../_Server";
import { z }                               from "zod";
import { generateToken, handleZodError }   from "../users/auth";
import { connectPlayer, disconnectPlayer } from "./socketHandler";

import { PlayerClassTest } from "../../classes/playerClassTest";

const pNameMin: number = 4;
const pNameMax: number = 12;


// =====================================================================
// GET > Player Page
// =====================================================================
export const playerPage = async (
   req: Request,
   res: Response,
) => {
   
   try {
      const userID: number = res.locals.userID;
      const { DB_Count, DB_Data }: any = await DBexecute(__dirname, "GetAllPlayers_ByUserID", { userID });
      
      let message: string = "Success";
      if(DB_Count === 0) message = "No character found !";

      res.send({ data: DB_Data, message });
   }
   
   catch {
      res.status(500).json({ message: `Could not load characters page !`});
   }
}


// =====================================================================
// POST > Create Player
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

      const { DB_Count, DB_Data}: any = await DBexecute(__dirname, "CreatePlayer", data);

      if(DB_Count === 1) {
         newPlayer.id = DB_Data[0].id;
         res.status(200).json({ message: `New charachter created ! ${ newPlayer.name }`});
      }
   }
   
   catch {
      res.status(500).json({ message: `Could not create character !`});
   }
}

// =====================================================================
// POST > Load World ==> Enter World
// =====================================================================
export const loadWorld = async (
   req:  Request,
   res:  Response,
   next: NextFunction,
) => {

   const schema = z.object({
      playerName: z.string().min(pNameMin).max(pNameMax).regex(nameReg),
   });
   
   const result = schema.safeParse(req.body);
   if(!result.success) return handleZodError(res, result);
   
   const { playerName }: IString = result.data;

   try {
      const userID: number = res.locals.userID;
      const { DB_Count, DB_Data }: any = await DBexecute(__dirname, "GetPlayer_ByName", { playerName, userID });
      if(DB_Count === 0) throw new Error;

      const player:      any    = DB_Data[0];
      const playerToken: string = generateToken(player.id);

      // ==> Send all files, pict, tiles and world's data (initpack) to client 
      // ==> When everything's loaded on client side => trigger const socket = io();

      res.send({ playerToken, isWorldReady: true });
      next();
   }

   catch {
      res.status(500).json({ message: `Invalid player name !`});
   }
}

export const enterWorld = async (
   req: Request,
   res: Response,
) => {
   
   try {
      const socketIO = new Server(server);
      
      socketIO.on("connection", (socket) => {
         connectPlayer(socket);
         disconnectPlayer(socket);
      });
   }

   catch {
      res.status(500).json({ message: `Could not enter world !`});
   }
}