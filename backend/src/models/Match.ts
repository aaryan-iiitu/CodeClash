import { Schema, Types, model } from "mongoose";

const matchSchema = new Schema(
  {
    user1: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    user2: {
      type: Types.ObjectId,
      ref: "User",
      required: true
    },
    problemId: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["waiting", "ongoing", "finished"],
      default: "waiting"
    },
    winner: {
      type: Types.ObjectId,
      ref: "User",
      default: null
    },
    startTime: {
      type: Date,
      default: null
    },
    endTime: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

export const Match = model("Match", matchSchema);
