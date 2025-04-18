import { useEffect, useRef } from "react";
import { View, Dimensions, ImageBackground, Animated } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

export default function CustomSplashScreen({ onAnimationComplete }: { onAnimationComplete: () => void }) {
  const screenWidth = Dimensions.get("window").width;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        onAnimationComplete(); 
      }, 500); 
    });
  }, []);

  return (
    <View style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../../../assets/images/startBgImg.png")}
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        resizeMode="cover"
      >
        <View className="flex-1 items-center justify-center">
          <Animated.Image
            source={require("../../../assets/images/flying-games.png")}
            style={{
              resizeMode: "contain",
              width: screenWidth * 0.8,
              height: 300,
              opacity: fadeAnim,
            }}
          />
        </View>
      </ImageBackground>
    </View>
  );
}
