//backend\src\app.ts
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { errorHandler } from "./middleware/error.middleware";
import { globalRateLimiter } from "./middleware/rateLimit.middleware";
// import passport from "./config/passport";


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.use(globalRateLimiter);
app.get("/", (req, res) => {
  res.send("Welcome to the RBAC Authentication API");
});

// app.use(passport.initialize());

app.use(errorHandler);

export default app;