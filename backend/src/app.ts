import cors from "cors";
import express from "express";
import duelRoutes from "./routes/duelRoutes";

export const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/duels", duelRoutes);
