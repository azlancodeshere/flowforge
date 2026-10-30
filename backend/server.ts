import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./db/db";
import userRoutes from "./src/routes/user.route";
import { ApiError } from "./src/utils/ApiError";
import workflowRoutes from "./src/routes/workflow.routes"


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/workflows", workflowRoutes);

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      success: false,
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    statusCode: 500,
    message: "Something went wrong",
    success: false,
  });
});

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
