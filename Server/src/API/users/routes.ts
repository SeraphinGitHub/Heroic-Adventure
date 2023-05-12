
import {
   signin,
   login,
   logout
} from "./controllers"

import { verifyToken } from "./auth"
import express  from "express"

const router = express.Router();

// POST
router.post("/signin", signin);
router.post("/login" , login );
router.post("/logout", verifyToken, logout);

export default router;