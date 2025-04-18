import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface UserData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  referralCode?: string;
  dateRegistered?: string;
  avatar?: string;
  email?: string;
  _id?: string;
  balance?: number;
  createdAt?: string;
}

interface UserState {
  userData: UserData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loading?: boolean;
}

const initialState: UserState = {
  userData: null,
  status: "idle",
  error: null,
};

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue }) => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (!authToken) {
        return rejectWithValue("No auth token found");
      }
      const jsonValue = await AsyncStorage.getItem("userData");
      if (!jsonValue) {
        return rejectWithValue("No user data found");
      }
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error("Error loading user data:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const saveUserData = createAsyncThunk(
  "user/saveUserData",
  async (userData: UserData) => {
    try {
      const jsonValue = JSON.stringify(userData);
      await AsyncStorage.setItem("userData", jsonValue);
      return userData;
    } catch (error) {
      console.error("Error saving user data:", error);
      throw error;
    }
  }
);

export const logoutUser = createAsyncThunk("user/logoutUser", async () => {
  try {
    await AsyncStorage.multiRemove([
      "userData",
      "authToken",
      "refreshToken",
      "isLoggedIn",
    ]);
    return null;
  } catch (error) {
    console.error("Error during logout:", error);
    throw error;
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserData: (state) => {
      state.userData = null;
      AsyncStorage.removeItem("userData").catch((err) =>
        console.error("Error clearing user data:", err)
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userData = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Unknown error";
      })
      .addCase(saveUserData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(saveUserData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.userData = action.payload;
      })
      .addCase(saveUserData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Unknown error";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.userData = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Logout failed";
      });
  },
});

export const { clearUserData } = userSlice.actions;

export default userSlice.reducer;
