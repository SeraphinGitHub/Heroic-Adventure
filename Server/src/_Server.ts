
"use strict"

// =====================================================================
// Server
// =====================================================================
import express, { Request, Response, NextFunction } from "express";
import http   from "http";
import dotenv from "dotenv";
dotenv.config();
const app    = express();
const server = http.createServer(app);


// =====================================================================
// Packages
// =====================================================================
import bodyParser from "body-parser";
// import { emit }   from "process";
import { Server } from "socket.io";
const socketIO  = new Server(server);

socketIO.on("connection", (socket) => {
   console.log("Connected !")
   socket.on("disconnect", () => console.log("Dis-connected !!!!!!!"));
});



// =================================================================================
// Disable CORS errors
// =================================================================================
app.use(bodyParser.json());
app.use((
   req:  Request,
   res:  Response,
   next: NextFunction
) => {
   res.setHeader("Access-Control-Allow-Origin", "*");
   res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization");
   res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
   next();
});

// app.use("/auth", userRoutes);
app.use("/auth", (
   req:  Request,
   res:  Response,
   next: NextFunction
) => {
   console.log(req.body.email);
});


// =================================================================================
// Start Server
// =================================================================================
server.listen(process.env.PORT || 2800, () => {
   console.log(`Listening on port ${process.env.PORT}`);
});

module.exports = app;