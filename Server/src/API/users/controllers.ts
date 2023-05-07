
import {
   IString,
   IUser,
} from "../../utils/interfaces";

import { Request, Response } from "express";
import { nameReg, pswReg }   from "../../utils/regex";
import { DBexecute }         from "../../DB/DataBase";
import { z }                 from "zod";

import bcrypt from "bcrypt";
import jwt    from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


// =====================================================================
// Token Generation
// =====================================================================
const generateToken = (
   // user: IUser,
   res:  Response
) => {

   // const token = jwt.sign(
   //    { userId: user.id },
   //    process.env.SECURITY_TOKEN!,
   //    { expiresIn: "24h" }
   // );

   // res.status(200).json({ token, message: `Bonjour ${user.name}, vous êtes connecté !` });
}


// =====================================================================
// Signin
// =====================================================================
export const signin = async (
   req: Request,
   res: Response,
) => {

   const loginSchema = z.object({
      userName:      z.string().min(5 ).max(12).regex(nameReg),
      verifUserName: z.string().min(5 ).max(12).regex(nameReg),
      password:      z.string().min(10).max(20).regex(pswReg),
      verifPassword: z.string().min(10).max(20).regex(pswReg),
   })
   .refine((data) => data.userName === data.verifUserName, { message: "Account names dismatch !" })
   .refine((data) => data.password === data.verifPassword, { message: "Passwords dismatch !"     });

   const result = loginSchema.safeParse(req.body);

   if(result.success) {
      const { userName, password }: IUser = result.data;

      try {
         const checkVacancy: any = await DBexecute(__dirname, "SELECT_User_ByName", { userName });
         if(requestFail(res, 1, checkVacancy, "Account name already exists !")) return;
         
         const hashPassword: string = await bcrypt.hash(password, 12);

         const user: IString = {
            userName,
            hashPassword,
         };

         const saveUser: any = await DBexecute(__dirname, "CREATE_User", user);
         if(requestFail(res, 0, saveUser, "Could not register account !")) return;

         res.status(200).json({ message: `User created, welcome ${userName} !` });
      }
      catch(error) { res.status(500).json({ error }) }
   }

   else {
      const message: string = result.error.issues[0].message;
      res.status(500).json({ success: false, error: message });
   }
}

const requestFail = (
   res:      Response,
   rowCount: number,
   rawData:  any,
   message:  string,
): boolean => {

   if(rawData.rowCount === rowCount) {
      res.status(500).json({ message });
      return false;
   };

   return true;
}


// =====================================================================
// Login
// =====================================================================
export const login = (
   req: Request,
   res: Response,
) => {
    
   // User.find()
   // .then( async (users) => {
      
   //    let userArray = [];
      
   //    for (i = 0; i < users.length; i++) {
   //       let user = users[i];

   //       await bcrypt.compare(req.body.email, users[i].email)
   //       .then(emailValid => {
               
   //             if(emailValid) return userArray.push(user);
   //             else return;
               
   //       }).catch(error => res.status(501).json({ error }));
   //    }


   //    const userIdInsideDB = userArray[0]._id;
   //    const passwordHashed = userArray[0].password;
      
   //    bcrypt.compare(req.body.password, passwordHashed)
   //    .then(passwordValid => {
   //       if(!passwordValid) return res.status(401).json({ message: "Mot de passe incorrect !" });

   //       res.status(200).json({
   //             userId: userIdInsideDB,
   //             token: jwt.sign(
   //                { userId: userIdInsideDB },
   //                "RANDOM_TOKEN_SECRET",
   //                { expiresIn: "24h" }
   //             )
   //       });

   //    }).catch(error => res.status(502).json({ error }));

   // }).catch(error => res.status(500).json({ error }));
};