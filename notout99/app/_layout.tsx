/** @format */

import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./store/index";
import { fetchUserData, saveUserData } from "./store/UserSlice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log("Starting auth initialization...");

        // Check auth state with detailed logging
        const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
        const authToken = await AsyncStorage.getItem("authToken");
        const userData = await AsyncStorage.getItem("userData");

        console.log("Auth State Check:", {
          isLoggedIn,
          hasAuthToken: !!authToken,
          hasUserData: !!userData,
          userDataContent: userData ? JSON.parse(userData) : null,
        });

        if (isLoggedIn === "true" && authToken && userData) {
          console.log("Valid auth state found, updating Redux store...");
          
          try {
            const result = await store.dispatch(fetchUserData()).unwrap();
            // Add a check for required fields
            if (!result.name) {
              console.log("User name not found in response:", result);
              // You might want to set a default name or handle this case specifically
            }
            console.log("Redux store updated successfully:", result);
            
            setIsInitialized(true);
            console.log("Navigating to home screen...");
            router.replace("/home");
          } catch (error) {
            // Don't clear auth state immediately on fetch failure
            console.error("Failed to fetch user data:", error);
            
            // Try to use cached userData instead
            try {
              const cachedUserData = JSON.parse(userData);
              await store.dispatch(saveUserData(cachedUserData));
              setIsInitialized(true);
              router.replace("/home");
              return;
            } catch (parseError) {
              console.error("Failed to use cached data:", parseError);
              // Only clear auth if we can't recover
              await AsyncStorage.multiRemove(["isLoggedIn", "authToken", "userData"]);
              setIsInitialized(true);
              router.replace("/(auth)/login");
            }
          }
        } else {
          console.log("Invalid or missing auth state, redirecting to login...");
          console.log("Missing items:", {
            isLoggedIn: !isLoggedIn,
            authToken: !authToken,
            userData: !userData,
          });

          await AsyncStorage.multiRemove([
            "isLoggedIn",
            "authToken",
            "userData",
          ]);
          setIsInitialized(true);
          router.replace("/(auth)/login");
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setIsInitialized(true);
        router.replace("/(auth)/login");
      }
    };

    initializeAuth();
  }, []);

  // Show loading state until initialized
  if (!isInitialized) {
    return (
      <Provider store={store}>
        <Stack screenOptions={{ headerShown: false }} />
      </Provider>
    );
  }

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Stack screenOptions={{ headerShown: false }} />
      </Provider>
    </QueryClientProvider>
  );
}
