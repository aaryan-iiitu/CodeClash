import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import matchRoutes from "./routes/matchRoutes";
import userRoutes from "./routes/userRoutes";
import { registerDuelSocket } from "./sockets/duelSocket";

dotenv.config();

const app = express();
const PORT = 5000;
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "CodeClash backend is running" });
});

const startServer = async () => {
  await connectDB();
  registerDuelSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
