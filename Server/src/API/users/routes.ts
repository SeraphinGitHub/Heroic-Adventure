
import { signin, login, logout } from "./controllers"
import { auth }                  from "./authentification"
import express                   from "express"

const router = express.Router();

router.post("/signin",       signin);
router.post("/login" ,       login );
router.post("/logout", auth, logout);

export default router;