
import {
   
} from "../../utils/interfaces";

import { Request, Response } from "express";
import { DBexecute }         from "../../DB/DataBase";

import dotenv from "dotenv";
dotenv.config();


// =====================================================================
// Load Player
// =====================================================================
export const loadPlayer = async (
   req: Request,
   res: Response,
) => {
   
   console.log("Player's data loaded !");
}