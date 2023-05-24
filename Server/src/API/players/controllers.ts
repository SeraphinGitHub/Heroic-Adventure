
import {
   IString,
} from "../../utils/interfaces";

import {
   handleZodError,
} from "../users/auth";

import { Request, Response } from "express";
import { nameReg }           from "../../utils/regex";
import { DBexecute }         from "../../DB/DataBase";
import { z }                 from "zod";

import { PlayerClassTest } from "../../classes/playerClassTest";

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
      const userID: number = res.locals.userID;
      const { DBcount, DBrows }: any = await DBexecute(__dirname, "GetAllPlayers_ByUserID", { userID });

      let message: string = "Success";
      if(DBcount === 0) message = `No character found !`;

      res.send({ data: DBrows, message });
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
   // console.log(req.body); // ******************************************************
   const schema = z.object({
      playerName: z.string().min(pNameMin).max(pNameMax).regex(nameReg),
   });
   
   const result = schema.safeParse(req.body);
   if(!result.success) return handleZodError(res, result);
   
   const { playerName }: IString = result.data;
   
   try {
      // **********  Check name vacancy  **********
      const { DBcount: playerExist }: any = await DBexecute(__dirname, "CheckNameVacancy", { playerName });
      
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

      const { DBcount, DBdata}: any = await DBexecute(__dirname, "CreatePlayer", data);

      if(DBcount === 1) {
         newPlayer.id = DBdata.id;
         res.status(200).json({ message: `New charachter created ! ${ newPlayer.name }`});
      }
   }
   
   catch {
      res.status(500).json({ message: `Could not create character !`});
   }
}