import cron from 'node-cron';
import { MyMatch } from '../models/myMatch.models.js';
import { playerController } from '../controllers/player.controllers.js';
import { fantasyTeamController } from '../controllers/fantasyTeam.controllers.js';

/**
 * CRON Job: liveScoreUpdater
 * Frequency: Runs every minute.
 * Purpose: Finds matches marked as 'Live' (status 3) in the local database
 *          and triggers player point updates, followed by team point/rank updates.
 */
cron.schedule(
    '* * * * *', // Runs every minute
    async () => {
        const jobName = 'liveScoreUpdater';
        console.log(`[${jobName}] Running live score update check...`);
        try {
            // --- Find Live Matches in Local DB ---
            const liveStatusCode = 3; // Status code for "Live" matches (VERIFY THIS)
            const liveMatches = await MyMatch.find({ status: liveStatusCode }); // Query local DB
            // --- End Find ---

            if (!liveMatches || liveMatches.length === 0) {
                console.log(`[${jobName}] No live matches found (status code ${liveStatusCode}).`);
                return;
            }

            console.log(`[${jobName}] Found ${liveMatches.length} live matches. Triggering updates...`);

            // Process each live match found locally
            for (const match of liveMatches) {
                const entitySportMatchId = match.match_id;
                const internalMatchId = match._id;
                let playerPointsWereUpdated = false;

                if (!entitySportMatchId) {
                    console.warn(`[${jobName}] Match document ${internalMatchId} missing entitySportMatchId. Skipping.`);
                    continue;
                }

                // --- Step 1: Update Player Live Stats and Fantasy Points ---
                try {
                    console.log(`[${jobName}] Player Points: Triggering update for match ${entitySportMatchId} (Internal: ${internalMatchId})...`);

                    // Mock response object that captures the result
                    let playerUpdateResult = null;
                    const mockResPlayer = {
                        status: (code) => ({
                            json: (data) => {
                                console.log(`[${jobName}] Player Points: Update response for ${entitySportMatchId}: ${data?.message}, Updated: ${data?.updatedCount}`);
                                // Check if the update was successful and players were modified
                                    if (data?.success && data?.updatedCount > 0) {
                                    playerPointsWereUpdated = true;
                                }
                                playerUpdateResult = data; // Store the result if needed elsewhere
                                return playerUpdateResult; // Return data to allow chaining if needed
                            }
                        })
                    };

                    await playerController.fetchAndUpdateLiveStatsAndPoints({ params: { match_id: entitySportMatchId } }, mockResPlayer);

                    // Optional: Delay
                    await new Promise((resolve) => setTimeout(resolve, 500));

                } catch (updateError) {
                    if (updateError.message?.includes("404")) {
                        console.warn(`[${jobName}] Player Points: API 404 for match ${entitySportMatchId}. May be inactive.`);
                    } else {
                        console.error(`[${jobName}] Player Points: Failed update for match ${entitySportMatchId}:`, updateError.message || updateError);
                    }
                    // Don't proceed to team updates if player update failed
                    continue;
                }

                // --- Step 2: Update Team Total Points & Ranks (only if player points were updated) ---
                if (playerPointsWereUpdated) {
                    console.log(`[${jobName}] Team Points: Triggering calculation for internal match ID ${internalMatchId}...`);
                    try {
                        // Pass the INTERNAL match ObjectId string
                        const mockReqTeam = { params: { match_id: internalMatchId.toString() } };
                        const mockResTeam = { status: () => ({ json: (d) => { /* Optional logging */ } }) };

                        await fantasyTeamController.calculateAndUpdatePoints(mockReqTeam, mockResTeam);
                        console.log(`[${jobName}] Team Points: Calculation triggered for match ${internalMatchId}.`);

                    } catch (teamCalcError) {
                        console.error(`[${jobName}] Team Points: Failed calculation for match ${internalMatchId}:`, teamCalcError.message || teamCalcError);
                    }
                } else {
                    console.log(`[${jobName}] Team Points: Skipping calculation for match ${internalMatchId} as player points were not updated or update failed.`);
                }
            } 

            console.log(`[${jobName}] Finished processing ${liveMatches.length} live matches.`);

        } catch (error) {
            console.error(`[${jobName}] Error during schedule execution:`, error);
        }
    },
    {
        scheduled: true,
        timezone: "Asia/Kolkata"
    }
);

console.log('Service Initialized: Live score updater cron job scheduled to run every minute.');

// Note: Ensure this file is executed when your server starts.
// You might need an empty export if using certain module systems or frameworks
// export {};