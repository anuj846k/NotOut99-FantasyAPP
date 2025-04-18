import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = `${process.env.API_URL}`;

export type PlayerType = {
  _id: string;
  player_id: number;
  name: string;
  short_name: string;
  image_url: string | null;
  team_id: number;
  team_name: string;
  role: "wicket-keeper" | "batsman" | "all-rounder" | "bowler";
  credits: number;
  fantasy_points: number;
  is_playing: boolean;
  is_captain?: boolean;
  is_vice_captain?: boolean;
};

interface LeaderboardEntry {
  _id: string;
  name: string;
  total_points: number;
  rank: number;
  user_id: {
    _id: string;
    firstName: string;
    lastName: string;
    name?: string;
  };
}

interface LeaderboardResponse {
  success: boolean;
  count: number;
  data: LeaderboardEntry[];
  message?: string;
}

// Helper function to get auth token
export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    // console.log("Don't worry token is stored:", token);
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Fetch players for a specific match
export const fetchPlayersForMatch = async (match_id: string) => {
  try {
    // First check if players already exist for this match
    const playersResponse = await axios.get(
      `${API_URL}/players?match_id=${match_id}`
    );

    // If players already exist, return them
    if (
      playersResponse.data?.success &&
      playersResponse.data?.data &&
      playersResponse.data.data.length > 0
    ) {
      console.log(
        `Found ${playersResponse.data.data.length} existing players for match ${match_id}`
      );

      return playersResponse.data.data.map((player) => ({
        ...player,
        credits: player.credits || Math.floor(Math.random() * 5) + 5,
        fantasy_points:
          player.fantasy_points || Math.floor(Math.random() * 50) + 50,
      }));
    }

    // If no players found, fetch from external API and save to our database
    console.log(
      `No players found. Fetching players for match ${match_id} from API`
    );
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const saveResponse = await axios.post(
      `${API_URL}/admin/players/fetch/${match_id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!saveResponse.data?.success) {
      throw new Error(
        saveResponse.data?.message || "Failed to fetch player data from API"
      );
    }

    // Now get the newly saved players
    const newPlayersResponse = await axios.get(`${API_URL}/players`, {
      params: { match_id },
    });

    if (newPlayersResponse.data?.success && newPlayersResponse.data?.data) {
      return newPlayersResponse.data.data.map((player) => ({
        ...player,
        credits: player.credits || Math.floor(Math.random() * 5) + 5,
        fantasy_points:
          player.fantasy_points || Math.floor(Math.random() * 50) + 50,
      }));
    } else {
      throw new Error("Failed to retrieve saved players");
    }
  } catch (err) {
    console.error(
      "Error in fetchPlayersForMatch:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};

export const createTeam = async (teamData: {
  contest_id: string;
  match_id: string;
  players: Array<{
    player_id: string;
    is_captain: boolean;
    is_vice_captain: boolean;
  }>;
}) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // console.log("Sending team data:", JSON.stringify(teamData, null, 2));

    const response = await axios.post(`${API_URL}/teams`, teamData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    console.error("Error creating team:", err);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
    throw err;
  }
};

// Get team details
export const getTeamById = async (teamId: string) => {
  try {
    const token = await getAuthToken();

    const response = await axios.get(`${API_URL}/teams/${teamId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return response.data;
  } catch (err) {
    console.error(
      "Error getting team details:",
      err.response?.data?.message || err.message
    );
    throw err;
  }
};

export const fetchUserContests = async (matchId: string) => {
  try {
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    // Make authenticated request to the correct endpoint
    const response = await fetch(
      `${API_URL}/user-contests?match_id=${matchId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();

    return data || { success: true, data: [] };
  } catch (error) {
    console.log("Error fetching user contests", error);
    return { success: true, data: [] };
  }
};

export const getUserTeamsForContest = async (
  matchId: string,
  contestId: string
) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_URL}/teams?match_id=${matchId}&contest_id=${contestId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user teams:", error);
    throw error;
  }
};

export const fetchContestLeaderboard = async (
  contestId: string
): Promise<LeaderboardResponse> => {
  if (!contestId) {
    console.error("Contest ID is required");
    return {
      success: false,
      count: 0,
      data: [],
      message: "Contest ID is missing",
    };
  }
  try {
    const response = await fetch(`${API_URL}/leaderboard/${contestId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }
    const data: LeaderboardResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching contest leaderboard:", error);
    throw error;
  }
};

export const getUserTeamsForMatch = async (matchId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/teams?match_id=${matchId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user teams:", error);
    throw error;
  }
};

// Add this function to get details for a specific team
export const getTeamDetails = async (teamId: string) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_URL}/teams/${teamId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();
    // console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching team details:", error);
    throw error;
  }
};
