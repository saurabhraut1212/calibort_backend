import express from "express";

import cors from "cors";
import healthRouter from "./routes/health";
import userRouter from "./routes/userRoutes";
import importRouter from "./routes/importRoutes";
import authRouter from "./routes/authRoutes";
import passwordRouter from "./routes/passwordRoutes";


const app = express();


app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/auth", passwordRouter);
app.use("/api/users", userRouter);
app.use("/api/import", importRouter);


app.get("/", (_req, res) => res.send("Calibort backend - running"));

export default app;
