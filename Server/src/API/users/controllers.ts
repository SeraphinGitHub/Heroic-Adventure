
import {
   ILogin,
   ISignin,
} from "../../utils/interfaces";

import {
   handleZodError,
   generateToken,
} from "./auth"

import { Request, Response } from "express";
import { nameReg, pswReg }   from "../../utils/regex";
import { DBexecute }         from "../../DB/DataBase";
import { z }                 from "zod";
import bcrypt                from "bcrypt";

const nameMin: number = 5;
const nameMax: number = 12;
const pswMin:  number = 10;
const pswMax:  number = 20;


// =====================================================================
// POST > Signin
// =====================================================================
export const signin = async (
   req: Request,
   res: Response,
) => {

   const schema = z.object({
      userName:       z.string().min(nameMin).max(nameMax).regex(nameReg),
      verifyUserName: z.string().min(nameMin).max(nameMax).regex(nameReg),
      password:       z.string().min(pswMin ).max(pswMax ).regex(pswReg ),
      verifyPassword: z.string().min(pswMin ).max(pswMax ).regex(pswReg ),
   })
   .refine((data) => data.userName === data.verifyUserName, { message: "Account names dismatch !" })
   .refine((data) => data.password === data.verifyPassword, { message: "Passwords dismatch !"     });

   const result = schema.safeParse(req.body);
   if(!result.success) return handleZodError(res, result);

   const { userName, password }: ISignin = result.data;

   try {
      const hashPsw: string = await bcrypt.hash(password, 12);
      const { DB_Count }:  any = await DBexecute(__dirname, "CreateUser", { userName, hashPsw });

      if(DB_Count === 1) {
         res.status(200).json({ message: `User created ! Welcome ${userName}` });
      }
      else res.status(500).json({ message: `User already exists !` });
   }

   catch {
      res.status(500).json({ message: `Could not register account !` });
   }
}


// =====================================================================
// POST > Login
// =====================================================================
export const login = async (
   req: Request,
   res: Response,
) => {
    
   const schema = z.object({
      userName: z.string().min(nameMin).max(nameMax).regex(nameReg),
      password: z.string().min(pswMin ).max(pswMax ).regex(pswReg ),
   });

   const result = schema.safeParse(req.body);
   if(!result.success) return handleZodError(res, result);

   const { userName, password }: ILogin = result.data;

   try {
      const { DB_Count, DB_Data }: any = await DBexecute(__dirname, "ConnectUser", { userName });
      const DB_User: any = DB_Data[0];

      if(DB_Count === 1) {
         const isPswValid: boolean = await bcrypt.compare(password, DB_User.password);
            
         if(isPswValid) {
            const userToken = generateToken(DB_User.id);
            res.status(200).json({ userToken, message: `Logged successfully ! Welcome ${DB_User.name}` });
         }
         else res.status(500).json({ message: `Invalid password !` });
      }
      else res.status(400).json({ message: `User not found !` });
   }

   catch {
      res.status(500).json({ message: `Could not log in !` });
   }
};


// =====================================================================
// POST > Logout
// =====================================================================
export const logout = async (
   req: Request,
   res: Response,
) => {

   try {
      const userID: number = res.locals.userID;
      const { DB_Count, DB_Data }: any = await DBexecute(__dirname, "DisconnectUser", { userID });
      const DB_User: any = DB_Data[0];

      if(DB_Count === 1) {
         res.status(200).json({ message: `${DB_User.name} disconnected !` });
      }
      else res.status(500).json({ message: `Could not disconnect !` });
   }

   catch {
      res.status(500).json({ message: `Session timed out !` })
   }
};