
import { Request, Response, NextFunction } from "express";
import jwt                                 from "jsonwebtoken";
import dotenv                              from "dotenv";
dotenv.config();


const getHeaderToken = (req: Request) => {
   return req.headers.authorization?.split(" ")[1];
}

export const handleResult = (
   result:   any,
   callback: Function,
   fallback: Function,
) => {

   if(result.rowCount === 1) callback(result.rows[0]);
   else fallback();
}

export const handleZodError = (
   res:    Response,
   result: any,
) => {

   const message: string = result.error.issues[0].message;
   res.status(500).json({ success: false, error: message });
}

export const generateToken = (
   userID: number,
) => {

   return jwt.sign(
      { userID },
      process.env.SECURITY_TOKEN!,
      { expiresIn: "24h" }
   );
}

export const verifyToken = (
   req:  Request,
   res:  Response,
   next: NextFunction,
) => {

   const token: any = getHeaderToken(req);
   
   if(typeof token === "undefined") res.status(400).json({ message: `Unauthenticated request !` });      
   else next();
}

export const getUserID = (req: Request): number | undefined => {
   
   const headerToken:  any = getHeaderToken(req);
   const decodedToken: any = jwt.verify(headerToken, process.env.SECURITY_TOKEN!);

   if(typeof decodedToken.userID === "number") return decodedToken.userID;
};

