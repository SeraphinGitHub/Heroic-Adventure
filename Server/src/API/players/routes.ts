
import { loadPlayer } from "./controllers"
import express           from "express"
const router = express.Router();

router.get("/load", loadPlayer);

export default router;