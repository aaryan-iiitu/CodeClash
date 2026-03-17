import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db";
import matchRoutes from "./routes/matchRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/matches", matchRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "CodeClash backend is running" });
});

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
