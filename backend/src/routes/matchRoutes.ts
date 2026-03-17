import { Router } from "express";
import { createMatch, updateMatch } from "../controllers/matchController";

const router = Router();

router.post("/", createMatch);
router.patch("/:id", updateMatch);

export default router;
