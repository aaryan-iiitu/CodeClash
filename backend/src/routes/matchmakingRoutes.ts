import { Router } from "express";
import { joinQueue } from "../controllers/matchmakingController";

const router = Router();

router.post("/join", joinQueue);

export default router;
