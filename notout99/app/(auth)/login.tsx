/** @format */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  ImageBackground,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useNavigation, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { requestOtp } from "@/app/api/postapi/postApi";

const LoginPage = () => {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState("");

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      const storedPhoneNumber = await AsyncStorage.getItem("phoneNumber");
      if (storedPhoneNumber) {
        if (storedPhoneNumber.startsWith("+91")) {
          setPhone(storedPhoneNumber.substring(3));
        } else {
          setPhone(storedPhoneNumber);
        }
      }
    };
    fetchPhoneNumber();
  }, []);

  const mutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: async (data) => {
      console.log("OTP Request successful:", data);
      await AsyncStorage.setItem("phoneNumber", `+91${phone}`);
      router.navigate("/(auth)/otp");
    },
    onError: (error) => {
      console.error("OTP Request failed:", error);
      setError(error.message || "Failed to request OTP");
    },
  });

  const handleChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue.length <= 10) {
      setPhone(numericValue);
    }
  };

  const handleLogin = async () => {
    console.log("Login clicked with phone:", `+91${phone}`);

    const phoneRegex = /^[1-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      setError("Please enter a valid 10 digit phone number");
      setCheckboxError("");
      return;
    }

    if (!isChecked) {
      setCheckboxError("You must certify that you are above 18 years.");
      setError("");
      return;
    }

    setError("");
    setCheckboxError("");
    mutation.mutate({ phoneNumber: `+91${phone}`, isRegistration: false });
  };

  // const handleClearStorage = async () => {
  //   try {
  //     await AsyncStorage.clear();
  //     console.log("Storage cleared successfully");
  //     setPhone("");
  //   } catch (error) {
  //     console.error("Error clearing storage:", error);
  //   }
  // };

  return (
    <ScrollView style={styles.container} bounces={false}>
      <View style={styles.contentContainer}>
        <View style={styles.imgContainer}>
          <Image
            source={require("../../assets/images/image1.png")}
            style={styles.loginImg}
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back,</Text>
          <Text style={styles.subtitle}>Login</Text>

          <Text style={styles.label}>Mobile Number:</Text>
          <View style={styles.phoneInputContainer}>
            <Text style={styles.phonePrefix}>+91</Text>
            <TextInput
              placeholder="Enter 10 digit number"
              keyboardType="numeric"
              value={phone}
              onChangeText={handleChange}
              style={styles.phoneInput}
              placeholderTextColor="#4D4747"
              maxLength={10}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={isChecked}
              onValueChange={setIsChecked}
              color={isChecked ? "#2D87AC" : undefined}
            />
            <Text style={styles.checkboxText}>
              I certify that I am above 18 years
            </Text>
          </View>
          {checkboxError ? (
            <Text style={styles.errorText}>{checkboxError}</Text>
          ) : null}

          <ImageBackground
            source={require("../../assets/images/btnbg.png")}
            style={styles.buttonBackground}
            resizeMode="cover"
          >
            <Pressable style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </Pressable>
          </ImageBackground>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => router.navigate("/register")}>
              <Text style={styles.boldText}>Register</Text>
            </Pressable>
          </View>
          {/* <Pressable
            style={styles.clearStorageButton}
            onPress={handleClearStorage}
          >
            <Text style={styles.clearStorageButtonText}>Clear Login State</Text>
          </Pressable> */}

          <View style={styles.dividerContainer}>
            <View style={styles.dottedLine} />
          </View>

          <Text style={styles.orSignInText}>or sign in with</Text>

          <View style={styles.socialContainer}>
            <Pressable style={styles.socialButton}>
              <Image
                source={require("../../assets/images/googleImg.png")}
                style={styles.socialIcon}
              />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Image
                source={require("../../assets/images/fbImg.png")}
                style={styles.socialIcon}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  contentContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
  imgContainer: { height: 350 },
  loginImg: { width: "100%", height: "100%" },
  formContainer: {
    backgroundColor: "#fff",
    width: "100%",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 30,
    elevation: 10,
    borderColor: "#f2f2f2",
    borderWidth: 1,
    marginTop: -35,
  },
  title: { fontSize: 24, fontWeight: "600", color: "#181818" },
  subtitle: {
    fontSize: 18,
    fontWeight: "400",
    color: "#181818",
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#181818", marginBottom: 5 },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#000",
    borderWidth: 0.4,
    borderRadius: 8,
    height: 45,
    backgroundColor: "#fff",
    elevation: 4,
  },
  phonePrefix: {
    fontSize: 16,
    paddingHorizontal: 10,
    color: "#000",
    fontWeight: "500",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    paddingVertical: 10,
  },
  phoneInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  errorText: { color: "red", fontSize: 12, marginTop: 5 },

  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 5,
  },
  checkboxText: { marginLeft: 8, fontSize: 14, color: "#333" },

  buttonBackground: {
    height: 50,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20,
  },
  button: { flex: 1, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 18, color: "#fff", fontWeight: "500" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 15 },
  footerText: { fontSize: 16 },
  boldText: { fontWeight: "700", color: "#2D87AC" },

  dividerContainer: { alignItems: "center", marginVertical: 10 },
  dottedLine: {
    width: "70%",
    height: 2,
    borderStyle: "dotted",
    borderWidth: 2,
    borderColor: "#444",
    borderRadius: 1,
    marginTop: 5,
  },

  orSignInText: {
    textAlign: "center",
    fontSize: 15,
    color: "#444",
    marginBottom: 10,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 20,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  socialIcon: { width: 40, height: 40 },

  clearStorageButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "center",
  },
  clearStorageButtonText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
});
