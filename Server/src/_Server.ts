
"use strict"

// =====================================================================
// Server
// =====================================================================
import express, { Request, Response, NextFunction } from "express";
import http                                         from "http";
import dotenv                                       from "dotenv";
dotenv.config();

export const app = express();
const server = http.createServer(app);


// =====================================================================
// Packages
// =====================================================================
import bodyParser    from "body-parser";
import { DBconnect } from "./DB/DataBase";
// import { Server }    from "socket.io";
// const socketIO  = new Server(server);

DBconnect();

// socketIO.on("connection", (socket) => {
//    console.log("Connected !")
//    socket.on("disconnect", () => console.log("Disconnected !"));
// });


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
server.listen(process.env.PORT || 2800, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});