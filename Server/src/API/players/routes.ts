
import {
   playerPage,
   enterWorld,
   createPlayer
} from "./controllers"

import { verifyToken } from "../users/auth"
import express  from "express"

const router = express.Router();

// GET
router.get("/page", verifyToken, playerPage);

// POST
router.post("/create", verifyToken, createPlayer);
router.post("/enter",  verifyToken, enterWorld);

export default router;