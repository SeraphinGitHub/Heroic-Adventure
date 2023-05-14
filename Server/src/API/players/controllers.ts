
import {
   IString,
} from "../../utils/interfaces";

import {
   handleResultDB,
   handleZodError,
   getUserID,
} from "../users/auth";

import { Request, Response } from "express";
import { nameReg }           from "../../utils/regex";
import { DBexecute }         from "../../DB/DataBase";
import { z }                 from "zod";

import { PlayerClassTest } from "./playerClassTest";

const pNameMin: number = 4;
const pNameMax: number = 12;


// =====================================================================
// Player Page ==> GET
// =====================================================================
export const playerPage = async (
   req: Request,
   res: Response,
) => {
   
   try {
      res.status(200).json({ message: `Charachter page loaded !`});
   }

   catch {
      res.status(500).json({ message: `Could not load page !`});
   }
}


// =====================================================================
// Enter World ==> GET
// =====================================================================
export const enterWorld = async (
   req: Request,
   res: Response,
) => {
   
   try {
      res.status(200).json({ message: `Entered world !`});
   }

   catch {
      res.status(500).json({ message: `Could not enter world !`});
   }
}


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
      // =======================================
      // ==> Check name vacancy
      // =======================================
      const vacancyResult: any = await DBexecute(__dirname, "CheckNameVacancy", { playerName });
      let isAvailalbe: unknown;
      
      handleResultDB(vacancyResult,
         () => isAvailalbe = false,
         () => isAvailalbe = true,   
      );

      if(!isAvailalbe) throw new Error;
      

      // =======================================
      // ==> Create player & save to DB
      // =======================================
      const newPlayer: PlayerClassTest = new PlayerClassTest(playerName);

      const data = {
         userID: getUserID(req)!,
         name:   playerName,
         ...newPlayer.export(),
      }

      const createdPlayerDB: any = await DBexecute(__dirname, "CreatePlayer", data);

      handleResultDB(createdPlayerDB,
         (playerDB: any) => {

            newPlayer.id = playerDB.id;
            res.status(200).json({ message: `New charachter created ! ${ newPlayer.name }`});
         },
         () => res.status(500).json({ message: `Could not create character !`}),   
      );
   }
   
   catch {
      res.status(500).json({ message: `This player name is unavailable !`});
   }
}