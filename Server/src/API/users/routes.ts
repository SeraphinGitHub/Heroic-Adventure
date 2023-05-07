
import { signin, login } from "./controllers"
import express           from "express"
const router = express.Router();

router.post("/signin", signin);
router.post("/login",  login );

export default router;