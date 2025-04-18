import { FantasyTeam } from "../models/team.models.js";
import { Player } from "../models/player.models.js";
import mongoose from "mongoose";
import { Contest } from "../models/contest.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const MAX_TEAMS_PER_USER = 4;

export const fantasyTeamController = {
    createTeam: async (req, res) => {
        try {
            const { contest_id, match_id, players } = req.body;
            if (!req.user || !req.user._id) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }
            const user_id = req.user._id;

            if (
                !contest_id ||
                !match_id ||
                !players ||
                !Array.isArray(players)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Missing required fields (name, contest_id, match_id, players array)",
                });
            }

            if (players.length !== 11) {
                return res.status(400).json({
                    success: false,
                    message: "Fantasy team must have exactly 11 players",
                });
            }

            const captainCount = players.filter((p) => p.is_captain).length;
            const viceCaptainCount = players.filter(
                (p) => p.is_vice_captain
            ).length;

            if (captainCount !== 1 || viceCaptainCount !== 1) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Team must have exactly one captain and one vice-captain",
                });
            }

            const playerIdsInput = players.map((p) => p.player_id);
            let playerObjectIds = [];
            try {
                playerObjectIds = playerIdsInput.map(
                    (id) => new mongoose.Types.ObjectId(id)
                );
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid player ID format provided.",
                });
            }

            const playerDetails = await Player.find({
                _id: { $in: playerObjectIds },
            });

            if (playerDetails.length !== 11) {
                const foundIds = new Set(
                    playerDetails.map((p) => p._id.toString())
                );
                const missingIds = playerIdsInput.filter(
                    (id) => !foundIds.has(id)
                );
                return res.status(400).json({
                    success: false,
                    message: `One or more players not found. Missing IDs: ${missingIds.join(", ")}`,
                });
            }

            const totalCredits = playerDetails.reduce(
                (sum, player) => sum + (player.credits || 0), 
                0
            );
            if (totalCredits > 100) {
                return res.status(400).json({
                    success: false,
                    message: `Team exceeds the total credit limit of 100. Current: ${totalCredits}`,
                });
            }

            const roleCounts = {
                "wicket-keeper": 0,
                batsman: 0,
                bowler: 0,
                "all-rounder": 0,
            };
            playerDetails.forEach((p) => {
                if (roleCounts.hasOwnProperty(p.role)) {
                    roleCounts[p.role]++;
                }
            });

            const minWk = 1,
                minBat = 3,
                minBowl = 3,
                minAr = 1;
            if (
                roleCounts["wicket-keeper"] < minWk ||
                roleCounts["batsman"] < minBat ||
                roleCounts["bowler"] < minBowl ||
                roleCounts["all-rounder"] < minAr
            ) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid team composition. Need minimum: ${minWk} WK, ${minBat} BAT, ${minBowl} BOWL, ${minAr} AR. Found: ${JSON.stringify(roleCounts)}`,
                });
            }

            let objectIdMatch, objectIdContest;
            try {
                objectIdMatch = new mongoose.Types.ObjectId(match_id);
                objectIdContest = new mongoose.Types.ObjectId(contest_id);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid match_id or contest_id format.",
                });
            }

            const existingTeamCount = await FantasyTeam.countDocuments({
                user_id: user_id,
                contest_id: objectIdContest,
                match_id: objectIdMatch,
            });

            if (existingTeamCount >= MAX_TEAMS_PER_USER) {
                return res.status(400).json({
                    success: false,
                    message: `You have reached the maximum limit of ${MAX_TEAMS_PER_USER} teams for this contest.`,
                });
            }
            const teamName = `Team ${existingTeamCount + 1}`;

            const formattedPlayers = players.map((player) => ({
                player_id: new mongoose.Types.ObjectId(player.player_id), 
                is_captain: !!player.is_captain, 
                is_vice_captain: !!player.is_vice_captain, 
            }));

            const fantasyTeam = new FantasyTeam({
                user_id,
                name: teamName,
                contest_id: objectIdContest, 
                match_id: objectIdMatch, 
                players: formattedPlayers,
                total_points: 0, 
            });

            await fantasyTeam.save();

            return res.status(201).json({
                success: true,
                message: `Fantasy team created successfully (Team ${existingTeamCount + 1} of ${MAX_TEAMS_PER_USER}).`,
                data: fantasyTeam,
            });
        } catch (error) {
            console.error("Error creating fantasy team:", error);
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Potential duplicate entry conflict.",
                });
            }
            return res.status(500).json({
                success: false,
                message: "Failed to create fantasy team.",
                error: error.message,
            });
        }
    },

    getUserTeams: async (req, res) => {
        try {
            const user_id = req.user._id; 
            const { match_id, contest_id } = req.query;

            const filter = { user_id };

            if (match_id) filter.match_id = match_id;
            if (contest_id) filter.contest_id = contest_id;

            const teams = await FantasyTeam.find(filter)
                .populate("players.player_id")
                .populate("contest_id", "name prize_pool entry_fee")
                .populate("match_id", "teams start_time status");

            return res.status(200).json({
                success: true,
                count: teams.length,
                data: teams,
            });
        } catch (error) {
            console.error("Error getting user teams:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get user teams",
                error: error.message,
            });
        }
    },

 
    getUserContests: async (req, res) => {
        try {
            const user_id = req.user._id; 
            const { match_id } = req.query;

            let filter = { user_id };
            if (match_id) {
                filter.match_id = match_id;
            }

            const userTeams =
                await FantasyTeam.find(filter).distinct("contest_id");

            const userContests = await Contest.find({
                _id: { $in: userTeams },
            });

            const enhancedContests = await Promise.all(
                userContests.map(async (contest) => {
                    const teamsCount = await FantasyTeam.countDocuments({
                        user_id,
                        contest_id: contest._id,
                    });

                    const participantsCount = await FantasyTeam.countDocuments({
                        contest_id: contest._id,
                    });

                    return {
                        ...contest.toObject(),
                        user_teams_count: teamsCount,
                        participants_count: participantsCount || 0,
                    };
                })
            );

            return res.status(200).json({
                success: true,
                data: enhancedContests,
            });
        } catch (error) {
            console.error("Error getting user contests:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get user contests",
                error: error.message,
            });
        }
    },

    getTeamById: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user._id; 

            const team = await FantasyTeam.findOne({
                _id: id,
                user_id,
            })
                .populate("players.player_id")
                .populate("contest_id")
                .populate("match_id");

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Team not found or unauthorized",
                });
            }

            return res.status(200).json({
                success: true,
                data: team,
            });
        } catch (error) {
            console.error("Error getting team:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get team details",
                error: error.message,
            });
        }
    },

    updateTeam: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, players } = req.body;
            const user_id = req.user._id; 
            const team = await FantasyTeam.findOne({ _id: id, user_id });

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Team not found or unauthorized",
                });
            }

            const match = await mongoose
                .model("MyMatch")
                .findById(team.match_id);
            if (match && match.status !== "upcoming") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot update team after match has started",
                });
            }

            let updatedData = {};

            if (name) {
                updatedData.name = name;
            }

            if (players) {
                if (players.length !== 11) {
                    return res.status(400).json({
                        success: false,
                        message: "Fantasy team must have exactly 11 players",
                    });
                }

                const captainCount = players.filter((p) => p.is_captain).length;
                const viceCaptainCount = players.filter(
                    (p) => p.is_vice_captain
                ).length;

                if (captainCount !== 1 || viceCaptainCount !== 1) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Team must have exactly one captain and one vice-captain",
                    });
                }

                const playerIds = players.map((p) => p.player_id);
                const playerDetails = await Player.find({
                    _id: { $in: playerIds },
                });

                if (playerDetails.length !== 11) {
                    return res.status(400).json({
                        success: false,
                        message: "One or more players not found",
                    });
                }

                const totalCredits = playerDetails.reduce(
                    (sum, player) => sum + player.credits,
                    0
                );
                if (totalCredits > 100) {
                    return res.status(400).json({
                        success: false,
                        message: "Team exceeds the total credit limit of 100",
                    });
                }

                const roleCounts = {
                    "wicket-keeper": playerDetails.filter(
                        (p) => p.role === "wicket-keeper"
                    ).length,
                    batsman: playerDetails.filter((p) => p.role === "batsman")
                        .length,
                    bowler: playerDetails.filter((p) => p.role === "bowler")
                        .length,
                    "all-rounder": playerDetails.filter(
                        (p) => p.role === "all-rounder"
                    ).length,
                };

                if (
                    roleCounts["wicket-keeper"] < 1 ||
                    roleCounts["batsman"] < 3 ||
                    roleCounts["bowler"] < 3 ||
                    roleCounts["all-rounder"] < 1
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Invalid team composition. Need minimum: 1 WK, 3 BAT, 3 BOWL, 1 AR",
                    });
                }

                updatedData.players = players;
            }

            const updatedTeam = await FantasyTeam.findByIdAndUpdate(
                id,
                updatedData,
                { new: true, runValidators: true }
            ).populate("players.player_id");

            return res.status(200).json({
                success: true,
                message: "Team updated successfully",
                data: updatedTeam,
            });
        } catch (error) {
            console.error("Error updating team:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update team",
                error: error.message,
            });
        }
    },

    deleteTeam: async (req, res) => {
        try {
            const { id } = req.params;
            const user_id = req.user._id; 

            const team = await FantasyTeam.findOne({ _id: id, user_id });

            if (!team) {
                return res.status(404).json({
                    success: false,
                    message: "Team not found or unauthorized",
                });
            }

            const match = await mongoose
                .model("MyMatch")
                .findById(team.match_id);
            if (match && match.status !== "upcoming") {
                return res.status(400).json({
                    success: false,
                    message: "Cannot delete team after match has started",
                });
            }

            await FantasyTeam.findByIdAndDelete(id);

            return res.status(200).json({
                success: true,
                message: "Team deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting team:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to delete team",
                error: error.message,
            });
        }
    },

    calculateAndUpdatePoints: async (req, res) => {
        try {
            const { match_id } = req.params;

            const teams = await FantasyTeam.find({ match_id }).populate(
                "players.player_id"
            );

            if (!teams.length) {
                return res.status(404).json({
                    success: false,
                    message: "No teams found for this match",
                });
            }

            const updatedTeams = [];

            for (const team of teams) {
                let totalPoints = 0;

                for (const playerEntry of team.players) {
                    const player = playerEntry.player_id;
                    let playerPoints = player.fantasy_points;

                    if (playerEntry.is_captain) {
                        playerPoints *= 2; // Double points for captain
                    } else if (playerEntry.is_vice_captain) {
                        playerPoints *= 1.5; // 1.5x points for vice captain
                    }

                    totalPoints += playerPoints;
                }

                const updatedTeam = await FantasyTeam.findByIdAndUpdate(
                    team._id,
                    { total_points: totalPoints },
                    { new: true }
                );

                updatedTeams.push(updatedTeam);
            }

            const contests = [
                ...new Set(teams.map((team) => team.contest_id.toString())),
            ];

            for (const contestId of contests) {
                const contestTeams = await FantasyTeam.find({
                    match_id,
                    contest_id: contestId,
                }).sort({ total_points: -1 });

                for (let i = 0; i < contestTeams.length; i++) {
                    await FantasyTeam.findByIdAndUpdate(contestTeams[i]._id, {
                        rank: i + 1,
                    });
                }
            }

            return res.status(200).json({
                success: true,
                message: "Team points calculated and updated successfully",
                count: updatedTeams.length,
            });
        } catch (error) {
            console.error("Error calculating team points:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to calculate team points",
                error: error.message,
            });
        }
    },

    getContestLeaderboard: async (req, res) => {
        try {
            const { contest_id } = req.params;

            const leaderboard = await FantasyTeam.find({ contest_id })
                .sort({ total_points: -1, rank: 1 })
                .populate("user_id", "firstName lastName")
                .select("name total_points rank user_id");

            return res.status(200).json({
                success: true,
                count: leaderboard.length,
                data: leaderboard,
            });
        } catch (error) {
            console.error("Error getting leaderboard:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get leaderboard",
                error: error.message,
            });
        }
    },
};
