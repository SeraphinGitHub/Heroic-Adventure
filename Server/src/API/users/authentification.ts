
import { Request, Response, NextFunction } from "express";
import jwt                                 from "jsonwebtoken";
import dotenv                              from "dotenv";
dotenv.config();


const getHeaderToken = (req: Request) => {
   return req.headers.authorization?.split(" ")[1];
}

// =====================================================================
// Auth
// =====================================================================
export const auth = (
   req:  Request,
   res:  Response,
   next: NextFunction,
) => {

   const token: any = getHeaderToken(req);
   
   if(typeof token === "undefined") res.status(400).json({ message: `Unauthenticated request !` });      
   else next();
}


// =====================================================================
// Generate
// =====================================================================
export const generateToken = (
   userID: number,
) => {

   return jwt.sign(
      { userID },
      process.env.SECURITY_TOKEN!,
      { expiresIn: "24h" }
   );
}


// =====================================================================
// Verify
// =====================================================================
export const verifyToken = (
   req:   Request,
   res:   Response,
) => {
   
   try {
      const token: any = getHeaderToken(req);
      return jwt.verify(token, process.env.SECURITY_TOKEN!);
   }

   catch {
      res.status(400).json({ message: `Session timed out !` });
   }
};

