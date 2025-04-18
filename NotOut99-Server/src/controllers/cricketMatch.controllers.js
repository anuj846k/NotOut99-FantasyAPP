import { asyncHandler } from "../utils/asyncHandler.js";
import axios from "axios";
import { Match } from "../models/match.models.js";
import { MyMatch } from "../models/myMatch.models.js";
// --- Configuration ---
const API_TOKEN = process.env.ENTITYSPORT_API_TOKEN || " ";
const BASE_API_URL = "https://rest.entitysport.com/v2/matches/";
// Define the statuses you want to fetch individually
// Status codes: 1=Scheduled, 2=Completed, 3=Live, 4=Cancelled (VERIFY THESE)
const STATUSES_TO_FETCH = [1, 2, 3, 4]; // Array of statuses
// --- End Configuration ---

/**
 * Fetches matches from EntitySport API for specified statuses,
 * updates/inserts them into the main 'Match' collection,
 * and synchronizes updates to the 'MyMatch' collection for existing tracked matches.
 * Run periodically via cron.
 */
const fetchAndStoreMatches = asyncHandler(async (req, res) => {
    console.log(
        `Starting fetchAndStoreMatches sync for statuses: ${STATUSES_TO_FETCH.join(", ")}`
    );
    let allMatchesFromApi = [];

    try {
        // --- Step 1: Fetch latest data for all relevant statuses ---
        for (const status of STATUSES_TO_FETCH) {
            const apiUrlForStatus = `${BASE_API_URL}?status=${status}&pre_squad=true&per_page=50&token=${API_TOKEN}`;
            console.log(
                `Fetching matches with status ${status} from ${apiUrlForStatus}...`
            );
            try {
                const { data } = await axios.get(apiUrlForStatus);
                if (
                    data &&
                    data.response &&
                    Array.isArray(data.response.items)
                ) {
                    console.log(
                        `Received ${data.response.items.length} matches for status ${status}.`
                    );
                    allMatchesFromApi = allMatchesFromApi.concat(
                        data.response.items
                    );
                } else {
                    console.warn(
                        `No 'items' array/invalid structure for status ${status}.`
                    );
                }
            } catch (apiError) {
                console.error(
                    `Error fetching matches for status ${status}:`,
                    apiError.message
                );
                if (apiError.response && apiError.response.status === 404) {
                    console.log(
                        `API returned 404 for status ${status}, likely no matches.`
                    );
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 200)); 
        }

        console.log(
            `Total unique matches fetched across all statuses: ${allMatchesFromApi.length}`
        ); 

        if (allMatchesFromApi.length === 0) {
            return res.json({
                success: true,
                message: "No relevant matches found in API responses.",
            });
        }

        const bulkOpsMatch = [];
        const processedMatchIds = new Set(); 
        const uniqueMatchesToProcess = []; 

        for (const match of allMatchesFromApi) {
            if (
                !match ||
                !match.match_id ||
                processedMatchIds.has(match.match_id)
            ) {
                continue; 
            }
            processedMatchIds.add(match.match_id);
            uniqueMatchesToProcess.push(match); 

            const matchDataToStore = {
                match_id: match.match_id,
                title: match.title,
                short_title: match.short_title,
                subtitle: match.subtitle,
                match_number: match.match_number,
                format: match.format,
                format_str: match.format_str,
                status: match.status,
                status_str: match.status_str,
                status_note: match.status_note,
                verified: match.verified,
                pre_squad: match.pre_squad,
                odds_available: match.odds_available,
                game_state: match.game_state,
                game_state_str: match.game_state_str,
                domestic: match.domestic,
                competition: match.competition,
                teama: match.teama,
                teamb: match.teamb,
                date_start: match.date_start,
                date_end: match.date_end,
                timestamp_start: match.timestamp_start,
                timestamp_end: match.timestamp_end,
                date_start_ist: match.date_start_ist,
                date_end_ist: match.date_end_ist,
                venue: match.venue,
                umpires: match.umpires,
                referee: match.referee,
                equation: match.equation,
                live: match.live,
                result: match.result,
                result_type: match.result_type,
                win_margin: match.win_margin,
                winning_team_id: match.winning_team_id,
                commentary: match.commentary,
                wagon: match.wagon,
                latest_inning_number: match.latest_inning_number,
                presquad_time: match.presquad_time,
                verify_time: match.verify_time,
                match_dls_affected: match.match_dls_affected,
            };

            bulkOpsMatch.push({
                updateOne: {
                    filter: { match_id: match.match_id },
                    update: { $set: matchDataToStore },
                    upsert: true, // Add if new, update if existing
                },
            });
        }

        let matchUpdateResult = null;
        if (bulkOpsMatch.length > 0) {
            console.log(
                `Executing bulkWrite with ${bulkOpsMatch.length} upsert operations on 'Match' collection...`
            );
            matchUpdateResult = await Match.bulkWrite(bulkOpsMatch);
            console.log(
                `Match Collection Sync Result: ${JSON.stringify(matchUpdateResult)}`
            );
        } else {
            console.log("No operations needed for 'Match' collection.");
        }

        const bulkOpsMyMatch = [];
        for (const match of uniqueMatchesToProcess) {
            const matchDataToStoreForMyMatch = {
                match_id: match.match_id,
                title: match.title,
                short_title: match.short_title,
                subtitle: match.subtitle,
                match_number: match.match_number,
                format: match.format,
                format_str: match.format_str,
                status: match.status,
                status_str: match.status_str,
                status_note: match.status_note,
                verified: match.verified,
                pre_squad: match.pre_squad,
                odds_available: match.odds_available,
                game_state: match.game_state,
                game_state_str: match.game_state_str,
                domestic: match.domestic,
                competition: match.competition,
                teama: match.teama,
                teamb: match.teamb,
                date_start: match.date_start,
                date_end: match.date_end,
                timestamp_start: match.timestamp_start,
                timestamp_end: match.timestamp_end,
                date_start_ist: match.date_start_ist,
                date_end_ist: match.date_end_ist,
                venue: match.venue,
                umpires: match.umpires,
                referee: match.referee,
                equation: match.equation,
                live: match.live,
                result: match.result,
                result_type: match.result_type,
                win_margin: match.win_margin,
                winning_team_id: match.winning_team_id,
                commentary: match.commentary,
                wagon: match.wagon,
                latest_inning_number: match.latest_inning_number,
                presquad_time: match.presquad_time,
                verify_time: match.verify_time,
                match_dls_affected: match.match_dls_affected,
            };
           
            bulkOpsMyMatch.push({
                updateOne: {
                    filter: { match_id: match.match_id }, 
                    update: { $set: matchDataToStoreForMyMatch },
                },
            });
        }

        let myMatchUpdateResult = null;
        if (bulkOpsMyMatch.length > 0) {
            console.log(
                `Executing bulkWrite with ${bulkOpsMyMatch.length} update operations on 'MyMatch' collection...`
            );
            myMatchUpdateResult = await MyMatch.bulkWrite(bulkOpsMyMatch);
            console.log(
                `MyMatch Collection Sync Result: ${JSON.stringify(myMatchUpdateResult)}`
            );
        } else {
            console.log(
                "No operations prepared for 'MyMatch' collection (no unique matches found or processed)."
            );
        }

        return res.json({
            success: true,
            message: `Sync processed ${uniqueMatchesToProcess.length} unique matches. Match collection - Upserted: ${matchUpdateResult?.upsertedCount || 0}, Modified: ${matchUpdateResult?.modifiedCount || 0}. MyMatch collection - Modified: ${myMatchUpdateResult?.modifiedCount || 0}`,
        });
    } catch (error) {
        console.error(
            "Overall error in fetchAndStoreMatches sync:",
            error.message
        );
        res.status(500).json({
            success: false,
            message: `Failed sync: ${error.message}`,
        });
    }
});

const getMatches = async (req, res) => {
    try {
        const matches = await Match.find().sort({ timestamp_start: 1 });
        res.json({ success: true, matches });
    } catch (error) {
        console.error("Error in getMatches:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

const addToMyMatches = asyncHandler(async (req, res) => {
    try {
        const { match_id } = req.body;
        if (!match_id) {
            return res
                .status(400)
                .json({ success: false, message: "Match ID required" });
        }

        const match = await Match.findOne({ match_id });
        if (!match) {
            return res
                .status(404)
                .json({ success: false, message: "Source match not found" });
        }

        const matchDetails = match.toObject();
        delete matchDetails._id;
        delete matchDetails.__v;

        console.log(
            `Adding/Updating MyMatch for ${match_id} with current data.`
        );
        const myMatchResult = await MyMatch.findOneAndUpdate(
            { match_id },
            matchDetails,
            { upsert: true, new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Match added/updated in My Matches",
            data: myMatchResult,
        });
    } catch (error) {
        console.error("Error in addToMyMatches:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const getMyMatches = asyncHandler(async (req, res) => {
    try {
        const myMatches = await MyMatch.find().sort({ timestamp_start: 1 });
        res.json({ success: true, myMatches });
    } catch (error) {
        console.error("Error in getMyMatches:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

const getMatchContests = asyncHandler(async (req, res) => {
    try {
        const { match_id } = req.params; // Extract match_id from request params

        if (!match_id) {
            return res
                .status(400)
                .json({ success: false, message: "Match ID is required" });
        }

        // Replace `{match_id}` in the URL with actual match_id
        const { data } = await axios.get(
            CONTEST_API_URL.replace("{match_id}", match_id)
        );

        if (data && data.response && data.response.items) {
            return res.json({ success: true, contests: data.response.items });
        }

        res.status(404).json({
            success: false,
            message: "No contests found for this match",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export {
    fetchAndStoreMatches,
    getMatches,
    addToMyMatches,
    getMyMatches,
    getMatchContests,
};
