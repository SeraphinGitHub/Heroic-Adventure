
import { Request, Response, NextFunction } from "express";
import jwt                                 from "jsonwebtoken";
import dotenv                              from "dotenv";
dotenv.config();


const getHeaderToken = (req: Request) => {
   return req.headers.authorization?.split(" ")[1];
}

export const handleZodError = (
   res:    Response,
   result: any,
) => {
   
   const message: string = result.error.issues[0].message;
   res.status(500).json({ success: false, error: message });
}

export const generateToken = (
   id: number,
) => {

   return jwt.sign(
      { id },
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

   if(typeof token !== "string") {
      return res.status(500).json({ message: `Unauthenticated request !` });
   }
   
   try {
      const { id }: any = jwt.verify(token, process.env.SECURITY_TOKEN!);
      res.locals.userID = id;
      next();
   }
   
   catch {
      res.status(500).json({ message: `Session timed out !` });
   }
}

