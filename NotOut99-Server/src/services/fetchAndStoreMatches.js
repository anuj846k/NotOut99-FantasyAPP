
import cron from 'node-cron';
// Adjust the path based on your project structure
import { fetchAndStoreMatches } from '../controllers/cricketMatch.controllers.js'; // Import the specific function
// Optional: If fetchAndStoreMatches needs req/res, you might need to call an internal route instead
// import axios from 'axios';

/**
 * CRON Job: matchStatusSync
 * Frequency: Runs every 15 minutes (adjust as needed).
 * Purpose: Calls the fetchAndStoreMatches controller function to synchronize
 *          the status and general details of matches (Scheduled, Live, Completed etc.)
 *          from the EntitySport API into the local 'Match' database collection.
 */
cron.schedule(
    '*/15 * * * *', // Runs every 15 minutes
    async () => {
        const jobName = 'matchStatusSync';
        console.log(`[${jobName}] Running periodic match status synchronization...`);
        try {
            // Option 1: Call the controller function directly (simplest if no req/res needed)
            // NOTE: This mock response is minimal. If the function uses 'res.json()', it needs modification or use Option 2.
            const mockRes = {
                json: (data) => console.log(`[${jobName}] Result:`, data.message || data),
                status: function(code) { console.warn(`[${jobName}] Status ${code} set`); return this; } // Mock status chaining
             };
            await fetchAndStoreMatches({}, mockRes); // Pass empty mock request and the mock response

            // Option 2: Make an internal HTTP request to an endpoint that calls fetchAndStoreMatches
            // Replace YOUR_PORT and the path if needed
            // const internalApiUrl = `https://localhost:YOUR_PORT/api/v1/matches/sync-from-api`; // Example endpoint
            // console.log(`[${jobName}] Calling internal endpoint: ${internalApiUrl}`);
            // const response = await axios.post(internalApiUrl); // Use POST or GET depending on your route setup
            // console.log(`[${jobName}] Internal endpoint response:`, response.data?.message || response.status);

            console.log(`[${jobName}] Match status synchronization finished.`);

        } catch (error) {
            console.error(`[${jobName}] Error during schedule execution:`, error.message || error);
            if (error.response) {
                console.error(`[${jobName}] Internal API Error Status:`, error.response.status);
            }
        }
    },
    {
        scheduled: true,
        timezone: "Asia/Kolkata" 
    }
);

console.log('Service Initialized: Match status sync cron job scheduled to run every 15 minutes.');
