import { Schema, model } from "mongoose";

const duelSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy"
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed"],
      default: "waiting"
    }
  },
  {
    timestamps: true
  }
);

export const Duel = model("Duel", duelSchema);
