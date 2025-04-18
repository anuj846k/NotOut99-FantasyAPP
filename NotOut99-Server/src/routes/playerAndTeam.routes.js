import express from "express";
import { playerController } from "../controllers/player.controllers.js";
import { fantasyTeamController } from "../controllers/fantasyTeam.controllers.js";
import {
    authMiddleware,
    adminAuthMiddleware,
} from "../middlewares/authMiddleWare.js";

// Player routes
const playerRouter = express.Router();

// Public routes
playerRouter.get("/players", playerController.getAllPlayers);
playerRouter.get("/players/:id", playerController.getPlayerById);

// Admin-only routes (should be protected)
playerRouter.post(
    "/admin/players/fetch/:match_id",
    // adminAuthMiddleware,
    playerController.fetchAndSavePlayersFromAPI
);
playerRouter.put(
    "/admin/players/:id",
    adminAuthMiddleware,
    playerController.updatePlayer
);
playerRouter.post(
    "/admin/players/playing-status",
    adminAuthMiddleware,
    playerController.updatePlayingStatus
);
playerRouter.post(
    "/admin/players/fantasy-points",
    adminAuthMiddleware,
    playerController.updateFantasyPoints
);

// Fantasy Team routes
const teamRouter = express.Router();

// All team routes should be protected
teamRouter.post("/teams", authMiddleware, fantasyTeamController.createTeam);
teamRouter.get("/teams", authMiddleware, fantasyTeamController.getUserTeams);
teamRouter.get(
    "/user-contests",
    authMiddleware,
    fantasyTeamController.getUserContests
);
teamRouter.get("/teams/:id", authMiddleware, fantasyTeamController.getTeamById);
teamRouter.put("/teams/:id", authMiddleware, fantasyTeamController.updateTeam);
teamRouter.delete(
    "/teams/:id",
    authMiddleware,
    fantasyTeamController.deleteTeam
);

// Admin routes for team management
teamRouter.post(
    "/admin/teams/calculate-points/:match_id",
    adminAuthMiddleware,
    fantasyTeamController.calculateAndUpdatePoints
);
teamRouter.get(
    "/leaderboard/:contest_id",
    fantasyTeamController.getContestLeaderboard
);

export { playerRouter, teamRouter };
