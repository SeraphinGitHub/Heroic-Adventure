
"use strict"

// =====================================================================
// Server
// =====================================================================
import express, { Request, Response, NextFunction } from "express";
import { GameHandlerClass }   from "./classes/_export";
import { DBconnect }          from "./DB/DataBase";
import http                   from "http";
import bodyParser             from "body-parser";
import dotenv                 from "dotenv";
dotenv.config();

export const app         = express();
export const appServer   = http.createServer(app);
export const GameHandler = new GameHandlerClass();

DBconnect();
GameHandler.start();


// =================================================================================
// Disable Errors
// =================================================================================
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((
   error: Error,
   req:   Request,
   res:   Response,
   next:  NextFunction,
) => {
   if(error) res.status(400).send({ message: `Invalid request !` });
   
   else {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
      
      next();
   }
});


// =====================================================================
// Routes
// =====================================================================
import userRoutes    from "./API/users/routes";
import playerRoutes  from "./API/players/routes";

app.use("/user",   userRoutes  );
app.use("/player", playerRoutes);


// =================================================================================
// Start Server
// =================================================================================
appServer.listen(process.env.PORT || 2800, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});