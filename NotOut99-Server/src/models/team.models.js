import mongoose from "mongoose";

const fantasyTeamSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        contest_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
        },
        match_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MyMatch",
            required: true,
        },
        players: [
            {
                player_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Player",
                },
                is_captain: {
                    type: Boolean,
                    default: false,
                },
                is_vice_captain: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        total_points: {
            type: Number,
            default: 0,
        },
        rank: {
            type: Number,
        },
    },
    { timestamps: true }
);

export const FantasyTeam = mongoose.model("FantasyTeam", fantasyTeamSchema);
