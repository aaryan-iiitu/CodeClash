import { Router } from "express";
import { getLeaderboard, loginUser, registerUser } from "../controllers/userController";

const router = Router();

router.get("/leaderboard", getLeaderboard);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
