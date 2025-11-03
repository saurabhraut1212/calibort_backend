import express from "express";

import cors from "cors";
import healthRouter from "./routes/health";

const app = express();

// Basic middlewares

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Health
app.use("/health", healthRouter);

// Root
app.get("/", (_req, res) => res.send("Calibort backend - running"));

export default app;
