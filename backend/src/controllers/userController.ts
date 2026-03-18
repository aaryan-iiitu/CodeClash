import { Request, Response } from "express";
import { User } from "../models/User";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { handle, password } = req.body;

    if (!handle || !password) {
      return res.status(400).json({ message: "Handle and password are required" });
    }

    const existingUser = await User.findOne({ handle });

    if (existingUser) {
      return res.status(409).json({ message: "Handle already registered" });
    }

    const user = await User.create({
      handle,
      password
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        handle: user.handle,
        rating: user.rating,
        matchesPlayed: user.matchesPlayed,
        wins: user.wins
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user", error });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { handle, password } = req.body;

    if (!handle || !password) {
      return res.status(400).json({ message: "Handle and password are required" });
    }

    const user = await User.findOne({ handle });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Login successful",
      user: {
        id: user._id,
        handle: user.handle,
        rating: user.rating,
        matchesPlayed: user.matchesPlayed,
        wins: user.wins
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login user", error });
  }
};

export const getLeaderboard = async (_req: Request, res: Response) => {
  try {
    const users = await User.find()
      .select("handle rating wins matchesPlayed")
      .sort({ rating: -1, wins: -1, matchesPlayed: 1 })
      .limit(20);

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch leaderboard", error });
  }
};
