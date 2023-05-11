
import {
   ILogin,
   ISignin,
} from "../../utils/interfaces";

import { Request, Response }          from "express";
import { generateToken, verifyToken } from "./authentification"
import { nameReg, pswReg }            from "../../utils/regex";
import { DBexecute }                  from "../../DB/DataBase";
import { z }                          from "zod";
import bcrypt                         from "bcrypt";

const nameMin: number = 5;
const nameMax: number = 12;
const pswMin:  number = 10;
const pswMax:  number = 20;


const handleResult = (
   result:   any,
   callback: Function,
   fallback: Function,
) => {

   if(result.rowCount === 1) callback(result.rows[0]);
   else fallback();
}

// =====================================================================
// Signin
// =====================================================================
export const signin = async (
   req: Request,
   res: Response,
) => {

   const signinSchema = z.object({
      userName:      z.string().min(nameMin).max(nameMax).regex(nameReg),
      verifUserName: z.string().min(nameMin).max(nameMax).regex(nameReg),
      password:      z.string().min(pswMin ).max(pswMax ).regex(pswReg ),
      verifPassword: z.string().min(pswMin ).max(pswMax ).regex(pswReg ),
   })
   .refine((data) => data.userName === data.verifUserName, { message: "Account names dismatch !" })
   .refine((data) => data.password === data.verifPassword, { message: "Passwords dismatch !"     });

   const result = signinSchema.safeParse(req.body);

   if(result.success) {
      const { userName, password }: ISignin = result.data;

      try {
         const hashPsw:    string = await bcrypt.hash(password, 12);
         const savedUser: unknown = await DBexecute(__dirname, "CREATE_User", { userName, hashPsw });

         handleResult(savedUser,
            () => res.status(200).json({ message: `User created ! Welcome ${userName}` }),
            () => res.status(500).json({ message: `User already exists !` })
         );
      }

      catch {
         res.status(500).json({ message: `Could not register account !` });
      }
   }

   else {
      const message: string = result.error.issues[0].message;
      res.status(500).json({ success: false, error: message });
   }
}


// =====================================================================
// Login
// =====================================================================
export const login = async (
   req: Request,
   res: Response,
) => {
    
   const loginSchema = z.object({
      userName: z.string().min(nameMin).max(nameMax).regex(nameReg),
      password: z.string().min(pswMin ).max(pswMax ).regex(pswReg ),
   });

   const result = loginSchema.safeParse(req.body);

   if(result.success) {
      const { userName, password }: ILogin = result.data;

      try {
         const getUser: unknown = await DBexecute(__dirname, "SELECT_User_ByName", { userName });

         handleResult(getUser,
            async (user: any) => {
               const isPswValid: boolean = await bcrypt.compare(password, user.password);
               
               if(isPswValid) {
                  const token = generateToken(user.id);
                  res.status(200).json({ token, message: `Logged successfully ! Welcome ${user.name}` });
               }
            },
            () => res.status(400).json({ message: `User not found !` })
         );
      }

      catch {
         res.status(500).json({ message: `Could not log in !` });
      }
   }

   else {
      const message: string = result.error.issues[0].message;
      res.status(500).json({ success: false, error: message });
   }
};


// =====================================================================
// Logout
// =====================================================================
export const logout = async (
   req: Request,
   res: Response,
) => {

   const token: any = verifyToken(req, res);

   if(!token || !token.userID) return;
   
   const { userID } = token;
   const getUser: unknown = await DBexecute(__dirname, "SELECT_User_ByID", { userID });

   handleResult(getUser,
      (user: any) => res.status(200).json({ message: `${user.name} disconnected !` }),
      (         ) => res.status(400).json({ message: `Could not disconnect !` })
   );
};

