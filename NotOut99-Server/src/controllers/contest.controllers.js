import { asyncHandler } from "../utils/asyncHandler.js";
import { Contest } from "../models/contest.models.js";
import { MyMatch } from "../models/myMatch.models.js";
import { FantasyTeam } from "../models/team.models.js";

const getMatchForContest = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required",
            });
        }

        const match = await MyMatch.findById(id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }

        res.json({
            success: true,
            match,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

const createContest = asyncHandler(async (req, res) => {
    try {
        const {
            match_id,
            contest_name,
            entry_fee,
            totalPricePool,
            firstPrice,
            secondPrice,
            maxEntries,
        } = req.body;

        if (
            !match_id ||
            !contest_name ||
            !entry_fee ||
            !totalPricePool ||
            !firstPrice ||
            !secondPrice ||
            !maxEntries
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const match = await MyMatch.findById(match_id);

        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }

        const newContest = new Contest({
            match_id,
            contest_name,
            entry_fee,
            totalPricePool,
            firstPrice,
            secondPrice,
            maxEntries,
        });

        await newContest.save();

        res.status(201).json({
            success: true,
            message: "Contest created successfully",
            contest: newContest,
            match_details: match,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

const getContestsByMatch = asyncHandler(async (req, res) => {
    try {
        const { match_id } = req.params;

        if (!match_id) {
            return res.status(400).json({
                success: false,
                message: "Match ID is required",
            });
        }

        const match = await MyMatch.findById(match_id);
        if (!match) {
            return res.status(404).json({
                success: false,
                message: "Match not found",
            });
        }

        const contests = await Contest.find({ match_id });

        const enhancedContests = await Promise.all(
            contests.map(async (contest) => {
                const participantsCount = await FantasyTeam.countDocuments({
                    contest_id: contest._id,
                });

                return {
                    ...contest.toObject(),
                    participants_count: participantsCount,
                };
            })
        );

        res.status(200).json({
            success: true,
            message: "Contests retrieved successfully",
            contests: enhancedContests,
            match_details: match,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

const getAllContest = asyncHandler(async (req, res) => {
    try {
        const contests = await Contest.find();

        const contestsWithMatchDetails = await Promise.all(
            contests.map(async (contest) => {
                const matchDetails = await MyMatch.findById(contest.match_id);
                const participantsCount = await FantasyTeam.countDocuments({
                    contest_id: contest._id,
                });
                return {
                    ...contest.toObject(),
                    match_details: matchDetails,
                    participants_count: participantsCount,
                };
            })
        );

        return res.status(200).json({
            success: true,
            message: "All contests retrieved",
            contests: contestsWithMatchDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

const checkContestEntry = asyncHandler(async (req, res) => {
    try {
        const { contestId } = req.params;
        const { userId } = req.query;

        if (!contestId || !userId) {
            return res.status(400).json({
                success: false,
                message: "Contest ID and User ID are required",
            });
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return res.status(404).json({
                success: false,
                message: "Contest not found",
            });
        }

        const existingTeams = await FantasyTeam.find({
            user_id: userId,
            contest_id: contestId,
        });

        const response = {
            success: true,
            hasEntry: existingTeams.length > 0,
            teamCount: existingTeams.length,
            maxTeamsAllowed: 3,
            contest: {
                entry_fee: contest.entry_fee,
                name: contest.contest_name,
                totalPricePool: contest.totalPricePool,
            },
        };

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error checking contest entry:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to check contest entry",
            error: error.message,
        });
    }
});

export {
    createContest,
    getMatchForContest,
    getAllContest,
    getContestsByMatch,
    checkContestEntry,
};
