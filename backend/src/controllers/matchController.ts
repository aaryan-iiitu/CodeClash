import { Request, Response } from "express";
import { Match } from "../models/Match";

export const createMatch = async (req: Request, res: Response) => {
  try {
    const { user1, user2, problemId, rating, status, winner, startTime, endTime } = req.body;

    if (!user1 || !user2 || !problemId || typeof rating !== "number") {
      return res.status(400).json({
        message: "user1, user2, problemId, and rating are required"
      });
    }

    const match = await Match.create({
      user1,
      user2,
      problemId,
      rating,
      status,
      winner,
      startTime,
      endTime
    });

    return res.status(201).json(match);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create match", error });
  }
};

export const updateMatch = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const match = await Match.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    return res.json(match);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update match", error });
  }
};
