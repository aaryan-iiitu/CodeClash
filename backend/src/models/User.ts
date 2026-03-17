import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 1200
    },
    matchesPlayed: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export const User = model("User", userSchema);
