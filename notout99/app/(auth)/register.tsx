import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { saveUserData } from "../store/UserSlice";
import { useAppDispatch } from "../store";
import { useMutation } from "@tanstack/react-query";
import { registerUser, requestOtp } from "../api/postapi/postApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    referralCode: "",
  });
  const requestOtpMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: async (data) => {
      console.log("OTP Request successful:", data);
      await AsyncStorage.setItem(
        "phoneNumber",
        `+91${formData.phoneNumber.trim()}`
      );
      setIsSubmitting(false);
      router.push("/(auth)/otp");
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("OTP Request failed:", error);

      let errorMessage = "Failed to send OTP. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      Alert.alert(
        "OTP Request Failed",
        errorMessage,
        [
          {
            text: "Try Again",
            onPress: () => handleSubmit()
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    }
  });
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      console.log("Registration response:", data);

      if (data.statusCode === 409) {
        Alert.alert(
          "Already Registered",
          "This phone number is already registered. Would you like to login instead?",
          [
            {
              text: "Go to Login",
              onPress: () => router.push("/(auth)/login")
            },
            {
              text: "Cancel",
              style: "cancel"
            }
          ]
        );
        setIsSubmitting(false);
        return;
      }

      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(data.data?.user || formData)
      );

      requestOtpMutation.mutate(
        {
          phoneNumber: `+91${formData.phoneNumber.trim()}`,
          isRegistration: true,
        }
      );
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Registration failed:", error);

      let errorMessage = "Registration failed. Please try again.";
      let errorTitle = "Registration Error";

      // Handle different error scenarios
      if (error.response?.data) {
        const responseData = error.response.data;
        
        if (responseData.statusCode === 409) {
          errorTitle = "Already Registered";
          errorMessage = "This phone number is already registered. Would you like to login?";
          
          Alert.alert(errorTitle, errorMessage, [
            {
              text: "Go to Login",
              onPress: () => router.push("/(auth)/login")
            },
            {
              text: "Try Again",
              style: "cancel"
            }
          ]);
          return;
        } else if (responseData.statusCode === 400) {
          errorMessage = responseData.message || "Please check your input details.";
        }
      }

      Alert.alert(errorTitle, errorMessage, [
        {
          text: "Try Again",
          style: "cancel"
        }
      ]);
    }
  });

  const handleChange = (fieldName: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: value,
    }));
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      phoneNumber: `+91${formData.phoneNumber.trim()}`, 
      referralCode: formData.referralCode.trim(),
    };

    console.log("Form data to be submitted:", userData);

    // Save to redux
    dispatch(saveUserData(userData));

    // Start registration process
    registerMutation.mutate(userData);
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return false;
    }

    const phoneRegex = /^[1-9]\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber.trim())) {
      Alert.alert("Error", "Please enter a valid 10 digit phone number");
      return false;
    }

    try {
      const existingPhone = `+91${formData.phoneNumber.trim()}`;
      
    } catch (error) {
      console.error("Error checking phone number:", error);
    }

    return true;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow} onPress={() => router.back()}>
              ←
            </Text>
          </Pressable>

          <Text style={styles.title}>Register</Text>

          <View style={styles.formContainer}>
            <Text style={styles.heading}>Let's create your account</Text>

            <TextInput
              placeholder="First Name"
              style={styles.input}
              placeholderTextColor="#777"
              value={formData.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Last Name"
              style={styles.input}
              placeholderTextColor="#777"
              value={formData.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              editable={!isSubmitting}
            />
            <TextInput
              placeholder="Phone number"
              style={styles.input}
              placeholderTextColor="#777"
              keyboardType="numeric"
              value={formData.phoneNumber}
              onChangeText={(text) => handleChange("phoneNumber", text)}
              editable={!isSubmitting}
              maxLength={10}
            />
            <TextInput
              placeholder="Referral Code (If any)"
              style={styles.input}
              placeholderTextColor="#777"
              value={formData.referralCode}
              onChangeText={(text) => handleChange("referralCode", text)}
              editable={!isSubmitting}
            />

            <Pressable
              onPress={handleSubmit}
              style={[
                styles.registerButton,
                isSubmitting && styles.disabledButton,
              ]}
              disabled={isSubmitting}
            >
              <ImageBackground
                source={require("../../assets/images/btnbg.png")}
                style={styles.buttonBackground}
              >
                <View style={styles.buttonContent}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
                  )}
                </View>
              </ImageBackground>
            </Pressable>

            <View style={styles.separator} />
            <Text style={styles.orText}>or register with</Text>

            <View style={styles.socialIcons}>
              <Image
                source={require("../../assets/images/googleImg.png")}
                style={styles.icon}
              />
              <Image
                source={require("../../assets/images/fbImg.png")}
                style={styles.icon}
              />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  backButton: {
    position: "absolute",
    top: 80,
    left: 15,
  },
  backArrow: { fontSize: 24, color: "#000" },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 15,
  },
  formContainer: {
    marginTop: 30,
  },
  heading: {
    fontSize: 18,
    fontWeight: "500",
    color: "#181818",
    marginBottom: 25,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    height: 50,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#F8F8F8",
  },
  registerButton: { marginTop: 20 },
  disabledButton: { opacity: 0.7 },
  buttonBackground: { height: 50, borderRadius: 10, overflow: "hidden" },
  buttonContent: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 18, color: "#fff", fontWeight: "600" },
  separator: { height: 1, backgroundColor: "#ccc", marginVertical: 30 },
  orText: { textAlign: "center", fontSize: 16, fontWeight: "500" },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  icon: { width: 60, height: 60, marginHorizontal: 12 },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },
  loginText: { fontSize: 16 },
  loginLink: { fontSize: 16, fontWeight: "700", color: "#000" },
});

export default Register;
