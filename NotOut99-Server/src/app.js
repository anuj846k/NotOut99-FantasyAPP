import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./services/liveScoreUpdater.js";
import "./services/fetchAndStoreMatches.js";

const app = express();

const corsUrl = "*";

app.use(cors(corsUrl));
app.use(cookieParser());

app.use(express.json());
app.use(express.static("/public/temp"));
app.use(express.urlencoded({ limit: "16kb", extended: true }));

// admin imports
import adminRouter from "./routes/admin.routes.js";
import matchRouter from "./routes/matches.routes.js";
import contestRouter from "./routes/contest.routes.js";
// user imports
import userRouter from "./routes/user.routes.js";
import { playerRouter, teamRouter } from "./routes/playerAndTeam.routes.js";
import coinsRouter from "./routes/coins.routes.js";
// import paymentRouter from "./payment.js";
// admin routes
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/admin", matchRouter);
app.use("/api/v1/admin", contestRouter);

// user router
app.use("/api/v1/user", userRouter);
app.use("/api/v1", playerRouter);
app.use("/api/v1", teamRouter);
app.use("/api/v1/coins", coinsRouter);
// app.use("/api/v1/payment", paymentRouter);

export { app };
