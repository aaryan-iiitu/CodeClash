import { Request, Response } from "express";
import { User } from "../models/User";
import { addUserToQueue, findMatch } from "../services/matchmakingService";

export const joinQueue = async (req: Request, res: Response) => {
  try {
    const { handle, ratingRange } = req.body as {
      handle?: string;
      ratingRange?: number;
    };

    if (!handle || typeof ratingRange !== "number") {
      return res.status(400).json({
        message: "handle and numeric ratingRange are required"
      });
    }

    let user = await User.findOne({ handle });

    // Frontend auth is local-only right now, so create a basic user record on first queue join.
    if (!user) {
      user = await User.create({
        handle,
        password: `local-${handle}`
      });
    }

    const queuedUser = addUserToQueue({
      userId: String(user._id),
      handle: user.handle,
      rating: user.rating,
      ratingRange
    });

    const matchedPair = findMatch(String(user._id));

    if (!matchedPair) {
      return res.json({
        status: "queued",
        user: queuedUser
      });
    }

    return res.json({
      status: "matched",
      pair: matchedPair
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to join queue",
      error
    });
  }
};
