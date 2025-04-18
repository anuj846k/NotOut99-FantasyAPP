import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
    {
        player_id: {
            type: Number,
        },
        name: {
            type: String,
            required: true,
        },
        short_name: {
            type: String,
        },
        image_url: {
            type: String,
        },
        nationality: {
            type: String,
        },
        team_id: {
            type: Number,
            required: true,
        },
        team_name: {
            type: String,
        },
        role: {
            type: String,
            required: true,
            enum: ["batsman", "bowler", "all-rounder", "wicket-keeper"],
        },
        playing_role: {
            type: String,
        },
        batting_style: {
            type: String,
        },
        bowling_style: {
            type: String,
        },
        recent_performance: {
            matches: { type: Number, default: 0 },
            runs: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            batting_avg: { type: Number, default: 0 },
            bowling_avg: { type: Number, default: 0 },
        },
        fantasy_points: {
            type: Number,
            default: 0,
        },
        credits: {
            type: Number,
            required: true,
        },
        is_playing: {
            type: Boolean,
            default: false,
        },
        live_stats: {
            runs: { type: Number, default: 0 },
            balls_faced: { type: Number, default: 0 },
            fours: {
                type: Number,
                default: 0,
            },
            sixes: {
                type: Number,
                default: 0,
            },
            strike_rate: {
                type: String,
                default: "0.00",
            },
            overs_bowled: {
                type: Number,
                default: 0,
            },
            runs_conceded: {
                type: Number,
                default: 0,
            },
            wickets: {
                type: Number,
                default: 0,
            },
            maidens: {
                type: Number,
                default: 0,
            },
            economy: {
                type: String,
                default: "0.00",
            },
        },
        match_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MyMatch",
            required: true,
        },
    },
    { timestamps: true }
);

// Add compound index for player_id and match_id
playerSchema.index({ player_id: 1, match_id: 1 }, { unique: true });

export const Player = mongoose.model("Player", playerSchema);
