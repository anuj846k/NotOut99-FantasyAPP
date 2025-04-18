import AsyncStorage from "@react-native-async-storage/async-storage";

const registerUser = async (registerUser: any) => {
  console.log("Request payload:", JSON.stringify(registerUser, null, 2));

  try {
    const response = await fetch(
      `${process.env.API_URL}/user/create-user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerUser),
      }
    );

    // Log the raw response
    const responseText = await response.text();
    console.log("Raw API response:", responseText);

    // // Parse as JSON if possible
    try {
      return JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response as JSON:", e);
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Network error details:", error);
    throw error;
  }
};

const requestOtp = async (loginUser: any) => {
  const response = await fetch(
    `${process.env.API_URL}/user/request-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginUser),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed with status ${response.status}: ${errorText}`);
  }

  return response.json();
};

const verifyLogin = async (otp: string, phoneNumber: string) => {
  try {
    console.log("Verifying OTP with:", { phoneNumber, otp });
    const response = await fetch(
      "${process.env.API_URL}/user/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber, otp }),
      }
    );
    // Check if response is successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      "Full OTP verification response:",
      JSON.stringify(data, null, 2)
    );

    if (data.success) {
      // Debug the data structure
      console.log("Response data structure:", Object.keys(data));
      console.log("User data structure:", Object.keys(data.data || {}));

      // Store user data
      await AsyncStorage.setItem("userData", JSON.stringify(data.data));

      // Extract tokens from the response
      const accessToken = data.data?.accessToken;
      const refreshToken = data.data?.refreshToken;

      console.log("Token extraction:", {
        accessTokenExists: !!accessToken,
        refreshTokenExists: !!refreshToken,
      });

      if (accessToken) {
        await AsyncStorage.setItem("authToken", accessToken);
        console.log("Stored access token successfully:", accessToken);
      } else {
        console.error("Access token not found in response");
      }

      if (refreshToken) {
        await AsyncStorage.setItem("refreshToken", refreshToken);
        console.log("Stored refresh token successfully:", refreshToken);
      } else {
        console.error("Refresh token not found in response");
      }

      // Store login status
      await AsyncStorage.setItem("isLoggedIn", "true");

      return data;
    }

    throw new Error(data.message || "Verification failed");
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

const postUserCoin = async (userId: string, amount: number) => {
  try {
    const response = await fetch(
      `${process.env.API_URL}/coins/${userId}/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          description: `Added ${amount * 2} coins for ₹${amount}`, // 1 rupee = 2 coins
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding coins:", error);
    throw error;
  }
};
export { requestOtp, verifyLogin, registerUser, postUserCoin };
