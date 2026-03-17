import { Duel } from "../models/Duel";

type CreateDuelInput = {
  title: string;
  difficulty?: "easy" | "medium" | "hard";
};

export const listActiveDuels = async () => {
  return Duel.find().sort({ createdAt: -1 });
};

export const createDuelRoom = async (payload: CreateDuelInput) => {
  return Duel.create({
    title: payload.title,
    difficulty: payload.difficulty || "easy"
  });
};
