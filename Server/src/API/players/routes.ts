
import {
   playerPage,
   enterWorld,
   createPlayer
} from "./controllers"

import { verifyToken } from "../users/auth"
import express  from "express"

const router = express.Router();

// GET
router.get("/page",    verifyToken, playerPage);
router.get("/join",    verifyToken, enterWorld);

// POST
router.post("/create", verifyToken, createPlayer);

export default router;