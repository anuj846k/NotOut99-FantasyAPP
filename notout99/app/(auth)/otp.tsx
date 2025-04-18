/** @format */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import OTPInput from "@/components/OtpInput";
import { useMutation } from "@tanstack/react-query";
import { verifyLogin } from "../api/postapi/postApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveUserData } from "../store/UserSlice";
import { useAppDispatch } from "@/app/store";

export default function Otp() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({ otp: "", phoneNumber: "" });

  const dispatch = useAppDispatch();

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) {
        setFormData((prev) => ({ ...prev, phoneNumber: storedPhoneNumber }));
      }
    };
    fetchPhoneNumber();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, otp }));
  }, [otp]);

  const handleVerify = async () => {
    try {
      const response = await verifyLogin(formData.otp, formData.phoneNumber);
      console.log("Verification successful:", response);

      if (response.success) {
        const { accessToken, refreshToken } = response.data;

        await Promise.all([
          AsyncStorage.setItem("userData", JSON.stringify(response.data)),
          AsyncStorage.setItem("authToken", accessToken),
          AsyncStorage.setItem("refreshToken", refreshToken),
          AsyncStorage.setItem("isLoggedIn", "true"),
        ]);

        await dispatch(saveUserData(response.data)).unwrap();

        router.replace("/home");
        console.log("Navifation comepleeted"); 
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setError(error.message || "Failed to verify OTP");
    }
  };

  const handleSubmit = () => {
    if (otp.length !== 6) {
      setOtpError(true);
      return;
    }

    setOtpError(false);
    setError(null);
    setFormData((prev) => ({ ...prev, otp }));
    handleVerify();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={50}
    >
      <View style={[styles.flexBox, { flex: 1, justifyContent: "center" }]}>
        <Image
          source={require("../../assets/images/otp.png")}
          style={{ height: 220, width: 300 }}
        />

        <View style={{ display: "flex", gap: 30 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={styles.title}>Enter OTP</Text>
          </View>
          <Text style={styles.subtitle}>
            6-digit OTP has been sent to your mobile number
          </Text>

          <OTPInput setOtp={setOtp} />
          {otpError && (
            <Text style={styles.errorText}>Invalid OTP. Please try again.</Text>
          )}
          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable onPress={handleSubmit} disabled={isLoading}>
            <LinearGradient
              colors={["cyan", "black"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Verify</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View>
            <Text style={styles.resendText}>RESEND OTP?</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  flexBox: {
    display: "flex",
    gap: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 15,
    color: "gray",
    textAlign: "center",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: -10,
  },
  button: {
    borderRadius: 10,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  resendText: {
    color: "grey",
    textAlign: "center",
    marginTop: 10,
  },
});
