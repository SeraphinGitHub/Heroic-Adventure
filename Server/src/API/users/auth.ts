
import { Request, Response, NextFunction } from "express";
import jwt                                 from "jsonwebtoken";
import dotenv                              from "dotenv";
dotenv.config();


const getHeaderToken = (req: Request) => {
   return req.headers.authorization?.split(" ")[1];
}

export const handleResultDB = (
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

   const token: string | undefined = getHeaderToken(req);

   if(token === undefined) {
      return res.status(500).json({ message: `Unauthenticated request !` });
   }
   
   try {
      const { userID }: any = jwt.verify(token, process.env.SECURITY_TOKEN!);
      res.locals.userID = userID;
      next();
   }
   
   catch {
      res.status(500).json({ message: `Session timed out !` });
   }
}

