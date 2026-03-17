import { Router } from "express";
import { createDuel, getActiveDuels } from "../controllers/duelController";

const router = Router();

router.get("/", getActiveDuels);
router.post("/", createDuel);

export default router;
