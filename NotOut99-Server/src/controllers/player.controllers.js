import axios from "axios";
import { Player } from "../models/player.models.js";
import { MyMatch } from "../models/myMatch.models.js";

// Configuration for EntitySport API
const API_BASE_URL = "https://rest.entitysport.com/v2";
const API_TOKEN = process.env.ENTITYSPORT_API_TOKEN;

function calculateFantasyPoints(liveStats) {
    let points = 0;

    if (!liveStats) {
        return 0;
    }

    // Batting points
    points += liveStats.runs || 0; // +1 per run
    points += (liveStats.fours || 0) * 1; // +1 bonus per four
    points += (liveStats.sixes || 0) * 2; // +2 bonus per six

    // Bowling points
    points += (liveStats.wickets || 0) * 25; // +25 per wicket
    points += (liveStats.maidens || 0) * 12; // +12 per maiden (Confirm this value)

    // Fielding points (add later if needed)
    // points += (liveStats.catches || 0) * 8;
    // points += (liveStats.stumpings || 0) * 12;
    // points += (liveStats.run_outs || 0) * 6; // Or 12 for direct

    return Math.max(0, points);
}

export const playerController = {
    fetchAndSavePlayersFromAPI: async (req, res) => {
        try {
            const { match_id } = req.params;

            if (!match_id) {
                return res
                    .status(400)
                    .json({ success: false, message: "Match ID is required" });
            }

            const match = await MyMatch.findById(match_id);

            if (!match) {
                return res
                    .status(404)
                    .json({ success: false, message: "Match not found" });
            }

            const entitySportMatchId = match.match_id;

            if (!entitySportMatchId) {
                return res.status(400).json({
                    success: false,
                    message: "No EntitySport match ID found for this match",
                });
            }

            const existingPlayers = await Player.find({ match_id });

            if (existingPlayers.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: "Players already exist for this match",
                    count: existingPlayers.length,
                    data: existingPlayers,
                });
            }

            const response = await axios.get(
                `${API_BASE_URL}/matches/${entitySportMatchId}/squads`,
                {
                    params: {
                        token: API_TOKEN,
                    },
                }
            );

            if (
                !response.data ||
                response.data.status !== "ok" ||
                !response.data.response
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "No squad data found for this match or invalid API response",
                });
            }

            const squadsData = response.data.response;
            const players = [];
            const detailedPlayers = squadsData.players || [];
            const playerDetailsMap = {};
            detailedPlayers.forEach((player) => {
                playerDetailsMap[player.pid] = player;
            });
            // **New:** Get playing XI info if available directly in squadsData (check API docs)
            const teamAPlaying11 = new Set(
                squadsData.teama?.playing11?.map((p) =>
                    parseInt(p.player_id)
                ) || []
            );
            const teamBPlaying11 = new Set(
                squadsData.teamb?.playing11?.map((p) =>
                    parseInt(p.player_id)
                ) || []
            );

            for (const team of [squadsData.teama, squadsData.teamb]) {
                const teamId = team.team_id;
                const teamName = team.name || team.title;

                const playerList = team.squads || [];

                for (const playerData of playerList) {
                    const playerId = parseInt(playerData.player_id);

                    const detailedInfo = playerDetailsMap[playerId] || {};

                    let role = "batsman";

                    if (playerData.role) {
                        const playerRole = playerData.role.toLowerCase();
                        if (playerRole === "wk") {
                            role = "wicket-keeper";
                        } else if (playerRole === "bowl") {
                            role = "bowler";
                        } else if (playerRole === "all") {
                            role = "all-rounder";
                        } else if (playerRole === "bat") {
                            role = "batsman";
                        }
                    }

                    const isPlaying =
                        team.team_id === squadsData.teama.team_id
                            ? teamAPlaying11.has(playerId)
                            : teamBPlaying11.has(playerId);

                    // **Initialize points and stats to 0**
                    let initialFantasyPoints = 0;
                    if (isPlaying) {
                        initialFantasyPoints += 4;
                    }

                    const initialLiveStats = {
                        runs: 0,
                        balls_faced: 0,
                        fours: 0,
                        sixes: 0,
                        strike_rate: "0.00",
                        overs_bowled: 0,
                        runs_conceded: 0,
                        wickets: 0,
                        maidens: 0,
                        economy: "0.00",
                    };

                    const credits = detailedInfo.fantasy_player_rating
                        ? Math.max(
                              5,
                              Math.min(10, detailedInfo.fantasy_player_rating)
                          )
                        : Math.floor(Math.random() * 6) + 5;

                    const playerToSave = {
                        player_id: playerId,
                        match_id: match._id,
                        name: playerData.name || detailedInfo.title,
                        short_name: detailedInfo.short_name || playerData.name,
                        image_url:
                            detailedInfo.profile_image ||
                            detailedInfo.thumb_url ||
                            (team.logo_url ? team.logo_url : null),
                        nationality: detailedInfo.nationality || null,
                        team_id: parseInt(teamId),
                        team_name: teamName,
                        role: role,
                        playing_role: detailedInfo.playing_role || role,
                        batting_style: detailedInfo.batting_style || null,
                        bowling_style: detailedInfo.bowling_style || null,
                        recent_performance: {
                            matches: detailedInfo.recent_match || 0,
                            runs: 0,
                            wickets: 0,
                            batting_avg: 0,
                            bowling_avg: 0,
                        },
                        fantasy_points: initialFantasyPoints,
                        credits: credits,
                        is_playing: isPlaying,
                        live_stats: initialLiveStats,
                    };

                    const player = await Player.findOneAndUpdate(
                        { player_id: playerId, match_id: match._id },
                        playerToSave,
                        { new: true, upsert: true }
                    );

                    players.push(player);
                }
            }

            console.log(`Fetching players for match_id: ${match_id}`);
            console.log(`EntitySport match_id: ${entitySportMatchId}`);

            return res.status(200).json({
                success: true,
                message: `Successfully imported ${players.length} players`,
                count: players.length,
                data: players,
            });
        } catch (error) {
            console.error("Error fetching players:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch players data",
                error: error.message,
            });
        }
    },

    getAllPlayers: async (req, res) => {
        try {
            const { team_id, role, is_playing, search, match_id } = req.query;

            const filter = {};
            if (match_id) filter.match_id = match_id;
            if (team_id) filter.team_id = parseInt(team_id);
            if (role) filter.role = role;
            if (is_playing !== undefined)
                filter.is_playing = is_playing === "true";
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: "i" } },
                    { short_name: { $regex: search, $options: "i" } },
                ];
            }

            const players = await Player.find(filter).sort({
                fantasy_points: -1,
            });

            return res.status(200).json({
                success: true,
                count: players.length,
                data: players,
            });
        } catch (error) {
            console.error("Error getting players:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get players",
                error: error.message,
            });
        }
    },

    getPlayerById: async (req, res) => {
        try {
            const { id } = req.params;

            if (isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid player ID format. Must be a number.",
                });
            }

            const player = await Player.findOne({ player_id: parseInt(id) });

            if (!player) {
                return res.status(404).json({
                    success: false,
                    message: "Player not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: player,
            });
        } catch (error) {
            console.error("Error getting player:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get player details",
                error: error.message,
            });
        }
    },

    getPlayersByRole: async (req, res) => {
        try {
            const { match_id } = req.params;

            const players = await Player.find({ match_id }).sort({
                fantasy_points: -1,
            });

            const wicketkeepers = players.filter(
                (p) => p.role === "wicket-keeper"
            );
            const batsmen = players.filter((p) => p.role === "batsman");
            const allrounders = players.filter((p) => p.role === "all-rounder");
            const bowlers = players.filter((p) => p.role === "bowler");

            return res.status(200).json({
                success: true,
                data: {
                    wicketkeepers,
                    batsmen,
                    allrounders,
                    bowlers,
                },
            });
        } catch (error) {
            console.error("Error getting players by role:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get players by role",
                error: error.message,
            });
        }
    },

    updatePlayer: async (req, res) => {
        try {
            const { id } = req.params;
            const { match_id } = req.body;
            const updateData = req.body;

            delete updateData._id;
            delete updateData.player_id;

            const player = await Player.findOneAndUpdate(
                { player_id: parseInt(id), match_id },
                updateData,
                { new: true, runValidators: true }
            );

            if (!player) {
                return res.status(404).json({
                    success: false,
                    message: "Player not found",
                });
            }

            return res.status(200).json({
                success: true,
                message: "Player updated successfully",
                data: player,
            });
        } catch (error) {
            console.error("Error updating player:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update player",
                error: error.message,
            });
        }
    },

    updatePlayingStatus: async (req, res) => {
        try {
            const { players } = req.body;

            if (!players || !Array.isArray(players)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid request format. Expected array of players",
                });
            }

            const updatePromises = players.map((player) => {
                return Player.findOneAndUpdate(
                    { player_id: parseInt(player.player_id) },
                    { is_playing: player.is_playing },
                    { new: true }
                );
            });

            const updatedPlayers = await Promise.all(updatePromises);

            return res.status(200).json({
                success: true,
                message: "Players playing status updated",
                count: updatedPlayers.length,
                data: updatedPlayers,
            });
        } catch (error) {
            console.error("Error updating playing status:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update playing status",
                error: error.message,
            });
        }
    },

    updateFantasyPoints: async (req, res) => {
        try {
            const { players } = req.body;

            if (!players || !Array.isArray(players)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid request format. Expected array of players",
                });
            }

            const updatePromises = players.map((player) => {
                return Player.findOneAndUpdate(
                    { player_id: parseInt(player.player_id) },
                    {
                        fantasy_points: player.fantasy_points,
                        "recent_performance.runs": player.runs || 0,
                        "recent_performance.wickets": player.wickets || 0,
                        "recent_performance.batting_avg":
                            player.batting_avg || 0,
                        "recent_performance.bowling_avg":
                            player.bowling_avg || 0,
                    },
                    { new: true }
                );
            });

            const updatedPlayers = await Promise.all(updatePromises);

            return res.status(200).json({
                success: true,
                message: "Players fantasy points updated",
                count: updatedPlayers.length,
                data: updatedPlayers,
            });
        } catch (error) {
            console.error("Error updating fantasy points:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update fantasy points",
                error: error.message,
            });
        }
    },

    fetchAndUpdateLiveStatsAndPoints: async (req, res) => {
        try {
            const { match_id } = req.params;

            const match = await MyMatch.findOne({
                match_id: parseInt(match_id),
            });
            if (!match) {
                return res.status(404).json({
                    success: false,
                    message: "Match not found",
                });
            }

            const matchPlayers = await Player.find({ match_id: match._id });
            const playerMap = new Map(
                matchPlayers.map((p) => [p.player_id, p])
            );

            const response = await axios.get(
                `${API_BASE_URL}/matches/${match_id}/live`,
                {
                    params: { token: API_TOKEN },
                }
            );

            if (
                !response.data ||
                response.data.status !== "ok" ||
                !response.data.response
            ) {
                console.log(
                    `No live match data found or invalid API response for match ${match_id}`
                );
                return res.status(200).json({
                    success: false,
                    message: "No match data found or invalid API response",
                    processed: false,
                });
            }

            const matchData = response.data.response;
            const playerUpdates = new Map();

            for (const batsman of matchData.batsmen || []) {
                const playerId = parseInt(batsman.batsman_id);
                if (!playerMap.has(playerId)) {
                    console.warn(
                        `Player ${playerId} not found in match ${match._id}`
                    );
                    continue;
                }

                const update = playerUpdates.get(playerId) || {};
                update.live_stats = {
                    ...update.live_stats,
                    runs: parseInt(batsman.runs || 0),
                    balls_faced: parseInt(batsman.balls_faced || 0),
                    fours: parseInt(batsman.fours || 0),
                    sixes: parseInt(batsman.sixes || 0),
                    strike_rate: batsman.strike_rate || "0.00",
                };
                playerUpdates.set(playerId, update);
            }

            for (const bowler of matchData.bowlers || []) {
                const playerId = parseInt(bowler.bowler_id);
                if (!playerMap.has(playerId)) {
                    console.warn(
                        `Player ${playerId} not found in match ${match._id}`
                    );
                    continue;
                }

                const update = playerUpdates.get(playerId) || {};
                update.live_stats = {
                    ...update.live_stats,
                    overs_bowled: parseFloat(bowler.overs || 0),
                    runs_conceded: parseInt(bowler.runs_conceded || 0),
                    wickets: parseInt(bowler.wickets || 0),
                    maidens: parseInt(bowler.maidens || 0),
                    economy: bowler.econ || "0.00",
                };
                playerUpdates.set(playerId, update);
            }

            const bulkOps = [];
            for (const [playerId, updateData] of playerUpdates.entries()) {
                const fantasyPoints = calculateFantasyPoints(
                    updateData.live_stats
                );

                bulkOps.push({
                    updateOne: {
                        filter: {
                            player_id: playerId,
                            match_id: match._id,
                        },
                        update: {
                            $set: {
                                live_stats: updateData.live_stats,
                                fantasy_points: fantasyPoints,
                                last_updated: new Date(),
                            },
                        },
                    },
                });
            }

            if (bulkOps.length > 0) {
                const updateResult = await Player.bulkWrite(bulkOps);
                console.log(
                    `Updated ${updateResult.modifiedCount} players for match ${match_id}`
                );
            }

            return res.status(200).json({
                success: true,
                message: "Player stats updated",
                updatedCount: bulkOps.length,
            });
        } catch (error) {
            console.error("Error updating live stats:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to update live stats",
                error: error.message,
            });
        }
    },
};
