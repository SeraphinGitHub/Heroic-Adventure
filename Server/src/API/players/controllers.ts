
import {
   IString,
} from "utils/interfaces";

import {
   handleResult,
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
   
   const playerNameSchema = z.object({
      playerName: z.string().min(pNameMin).max(pNameMax).regex(nameReg),
   })

   const result = playerNameSchema.safeParse(req.body);

   if(result.success) {
      const { playerName }: IString = result.data;

      try {
         const newPlayer: PlayerClassTest = new PlayerClassTest(playerName);

         const data = {
            userID:    getUserID(req)!,
            name:      playerName,
            ...newPlayer.export(),
         }

         const getPlayerDB: any = await DBexecute(__dirname, "CreatePlayer", data);

         handleResult(getPlayerDB,
            (playerDB: any) => {

               newPlayer.id = playerDB.id;
               res.status(200).json({ message: `New charachter created ! ${ newPlayer.name }`});
            },   
            () => res.status(500).json({ message: `Unable to overwrite player !`}),   
         );

         newPlayer.run();
      }

      catch {
         res.status(500).json({ message: `Could not create character !`});
      }
   }

   else handleZodError(res, result);
}