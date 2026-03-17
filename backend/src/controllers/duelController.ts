import { Request, Response } from "express";
import { createDuelRoom, listActiveDuels } from "../services/duelService";

export const getActiveDuels = async (_req: Request, res: Response) => {
  const duels = await listActiveDuels();
  res.json(duels);
};

export const createDuel = async (req: Request, res: Response) => {
  const duel = await createDuelRoom(req.body);
  res.status(201).json(duel);
};
