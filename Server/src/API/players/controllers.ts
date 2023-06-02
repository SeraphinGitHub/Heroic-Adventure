
import {
   IEntity,
   IString,
} from "../../utils/interfaces";

import { Request, Response, NextFunction } from "express";
import { generateToken, handleZodError }   from "../users/auth";
import { nameReg }                         from "../../utils/regex";
import { DBexecute }                       from "../../DB/DataBase";
import { PlayerClass }                     from "../../classes/_Export";
import { z }                               from "zod";

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
      const { DB_Count, DB_Row }: any = await DBexecute(__dirname, "GetAllPlayers", { userID });
      
      let message: string = "Success";
      if(DB_Count === 0) message = "No character found !";

      res.send({ characters: DB_Row, message });
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
      const { DB_Count: playerExist }: any = await DBexecute(__dirname, "CheckNameVacancy", { playerName });
      
      if(playerExist === 1) {
         return res.status(500).json({ message: `This player name is unavailable !` });
      }
      
      const entity: IEntity = {
         userID: res.locals.userID,
         playerName,
      }

      const Player: PlayerClass = new PlayerClass(entity);
      const isSuccess: boolean  = await Player.createDB();

      if(!isSuccess) throw new Error;
      
      res.status(200).json({ message: `New charachter created ! ${ Player.name }`});
   }
   
   catch {
      res.status(500).json({ message: `Could not create character !`});
   }
}


// =====================================================================
// POST > Enter World
// =====================================================================
export const enterWorld = async (
   req:  Request,
   res:  Response,
) => {

   const schema = z.object({
      playerName: z.string().min(pNameMin).max(pNameMax).regex(nameReg),
   });
   
   const result = schema.safeParse(req.body);
   if(!result.success) return handleZodError(res, result);
   
   const { playerName }: IString = result.data;

   try {
      // ==> Send all files, pict, tiles and world's data (initpack) to client 
      // ==> When everything's loaded on client side => trigger const socket = io();
      
      const entity: IEntity = {
         userID: res.locals.userID,
         playerName,
      }

      const { DB_Count, DB_Row }: any = await DBexecute(__dirname, "GetPlayerID", entity);
      if(DB_Count === 0) throw new Error;

      const playerID:    any    = DB_Row[0].id;
      const playerToken: string = generateToken(playerID);

      res.send({ playerToken, message: `Welcome to Heroic-Adventure ${playerName} !` });
   }

   catch {
      res.status(500).json({ message: `Invalid player name !`});
   }
}
