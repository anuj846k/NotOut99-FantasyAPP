import { getAuthToken } from "./teamApi";

// const API_URL = "${process.env.API_URL}";

const fetchMyMatches = async () => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/admin/get-my-matches`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching", error);
  }
};

const fetchContest = async () => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/admin/get-all-contests`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching", error);
  }
};

const fetchContestByMatch = async (match_id: string) => {
  try {
    if (!match_id) {
      throw new Error("Invalid match ID");
    }

    const response = await fetch(
      `${process.env.API_URL}/admin/contests/${match_id}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching contest data:", error);

    return {
      contests: [],
      error: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const fetchCoinsOfUser = async (userId: string) => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/coins/${userId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log("Error fetching coins data:", error);

    return {
      balance: 0,
      transactions: [],
      error: true,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const checkContestEntry = async (userId: string, contestId: string) => {
  try {
    const token = await getAuthToken();
    const response = await fetch(
      `${process.env.API_URL}/contests/${contestId}/check-entry?userId=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking contest entry:', error);
    return { error: true };
  }
};

export { fetchMyMatches, fetchContest, fetchContestByMatch, fetchCoinsOfUser,checkContestEntry };
