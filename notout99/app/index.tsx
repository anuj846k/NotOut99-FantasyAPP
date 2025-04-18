import { useState } from "react";
import { useRouter } from "expo-router";
import CustomSplashScreen from "./screens/splash/SplashScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const handleAnimationComplete = async () => {
    setShowSplash(false);
    const isLoggedIn = await AsyncStorage.getItem("isLoggedIn");
    const authToken = await AsyncStorage.getItem("authToken");
    if (isLoggedIn === "true" && authToken) {
      router.replace("/home");
    } else {
      router.replace("/(auth)/login");
    }
  };

  if (showSplash) {
    return <CustomSplashScreen onAnimationComplete={handleAnimationComplete} />;
  }

  return null;
}
