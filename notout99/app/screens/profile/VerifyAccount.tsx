import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Upload,
  Check,
  AlertCircle,
  Camera,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";

const VerifyAccount = () => {
  const router = useRouter();
  const [panNumber, setPanNumber] = useState("");
  const [aadharNumber, setAadharNumber] = useState("");
  const [panImage, setPanImage] = useState(null);
  const [aadharFrontImage, setAadharFrontImage] = useState(null);
  const [aadharBackImage, setAadharBackImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (setImageFunction) => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera roll permission to upload images");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageFunction(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const takePhoto = async (setImageFunction) => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert("Permission Denied", "We need camera permission to take photos");
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageFunction(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!panNumber.trim()) {
      Alert.alert("Error", "Please enter your PAN number");
      return;
    }

    if (!aadharNumber.trim()) {
      Alert.alert("Error", "Please enter your Aadhar number");
      return;
    }

    if (!panImage) {
      Alert.alert("Error", "Please upload your PAN card image");
      return;
    }

    if (!aadharFrontImage || !aadharBackImage) {
      Alert.alert("Error", "Please upload both sides of your Aadhar card");
      return;
    }

    // Validate PAN format (ABCDE1234F)
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      Alert.alert("Error", "Please enter a valid PAN number");
      return;
    }

    // Validate Aadhar format (12 digits)
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(aadharNumber)) {
      Alert.alert("Error", "Please enter a valid 12-digit Aadhar number");
      return;
    }

    setIsSubmitting(true);

    try {
      // const response = await api.submitVerification({
      //   panNumber,
      //   aadharNumber,
      //   panImage,
      //   aadharFrontImage,
      //   aadharBackImage
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        "Verification Submitted",
        "Your documents have been submitted for verification. This process may take 24-48 hours.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error("Verification submission failed:", error);
      Alert.alert("Submission Failed", "Please try again later");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAadharNumber = (text) => {
    // Remove any non-digits
    const cleaned = text.replace(/\D/g, "");
    
    // Limit to 12 digits
    const limited = cleaned.substring(0, 12);
    
    // Format with spaces (XXXX XXXX XXXX)
    let formatted = "";
    for (let i = 0; i < limited.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += " ";
      }
      formatted += limited[i];
    }
    
    return formatted;
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['right', 'left', 'bottom']}>
      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Account</Text>
      </LinearGradient>

      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.infoBox}>
          <AlertCircle size={20} color="#e85d04" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Account verification is required to participate in contests with cash prizes and to withdraw winnings.
          </Text>
        </View>

        {/* PAN Card Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAN Card Details</Text>
          
          <Text style={styles.inputLabel}>PAN Number</Text>
          <TextInput
            style={styles.input}
            value={panNumber}
            onChangeText={(text) => setPanNumber(text.toUpperCase())}
            placeholder="Enter PAN Number (e.g., ABCDE1234F)"
            maxLength={10}
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Upload PAN Card Image</Text>
          
          {panImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: panImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => pickImage(setPanImage)}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtonsContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickImage(setPanImage)}
              >
                <Upload size={20} color="#e85d04" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => takePhoto(setPanImage)}
              >
                <Camera size={20} color="#e85d04" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aadhar Card Details</Text>
          
          <Text style={styles.inputLabel}>Aadhar Number</Text>
          <TextInput
            style={styles.input}
            value={aadharNumber}
            onChangeText={(text) => {
              const formatted = formatAadharNumber(text);
              setAadharNumber(formatted);
            }}
            placeholder="Enter Aadhar Number (e.g., 1234 5678 9012)"
            keyboardType="number-pad"
            maxLength={14} // 12 digits + 2 spaces
          />

          <Text style={styles.inputLabel}>Upload Aadhar Front Side</Text>
          
          {aadharFrontImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: aadharFrontImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => pickImage(setAadharFrontImage)}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtonsContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickImage(setAadharFrontImage)}
              >
                <Upload size={20} color="#e85d04" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => takePhoto(setAadharFrontImage)}
              >
                <Camera size={20} color="#e85d04" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.inputLabel}>Upload Aadhar Back Side</Text>
          
          {aadharBackImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: aadharBackImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.changeImageButton}
                onPress={() => pickImage(setAadharBackImage)}
              >
                <Text style={styles.changeImageText}>Change Image</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.uploadButtonsContainer}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => pickImage(setAadharBackImage)}
              >
                <Upload size={20} color="#e85d04" />
                <Text style={styles.uploadButtonText}>Upload</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => takePhoto(setAadharBackImage)}
              >
                <Camera size={20} color="#e85d04" />
                <Text style={styles.uploadButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[
            styles.submitButton, 
            isSubmitting && styles.submitButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Check size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit for Verification</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            By submitting your documents, you agree to our verification process. Your information is secure and will only be used for verification purposes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  infoBox: {
    backgroundColor: "#fff8f3",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#ffedd5",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    color: "#7c2d12",
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  uploadButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e85d04",
    borderRadius: 8,
    padding: 12,
    flex: 0.48,
  },
  uploadButtonText: {
    color: "#e85d04",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f1f5f9",
  },
  changeImageButton: {
    backgroundColor: "#f1f5f9",
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  changeImageText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    backgroundColor: "#e85d04",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  submitButtonDisabled: {
    backgroundColor: "#fb923c",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  disclaimer: {
    padding: 16,
  },
  disclaimerText: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});

export default VerifyAccount;