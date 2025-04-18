import React, { useRef, useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";

interface OTPInputProps {
  setOtp: (otp: string) => void;
}

const OTPInput: React.FC<OTPInputProps> = ({ setOtp }) => {
  const [otp, setLocalOtp] = useState(["", "", "", "", "", ""]); // Updated to 6 digits
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (value: string, index: number) => {
    const sanitizedValue = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];

    if (sanitizedValue) {
      newOtp[index] = sanitizedValue;
      setLocalOtp(newOtp);
      setOtp(newOtp.join(""));

      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (event: any, index: number) => {
    if (event.nativeEvent.key === "Backspace") {
      const newOtp = [...otp];
      if (newOtp[index] === "" && index > 0) {
        inputRefs.current[index - 1]?.focus();
        newOtp[index - 1] = "";
      } else {
        newOtp[index] = "";
      }
      setLocalOtp(newOtp);
      setOtp(newOtp.join(""));
    }
  };

  return (
    <View style={styles.inputContainer}>
      {otp.map((_, index) => (
        <TextInput
          key={index}
          style={styles.input}
          maxLength={1}
          value={otp[index]}
          keyboardType="numeric"
          onChangeText={(value) => handleChange(value, index)} // Pass index explicitly
          onKeyPress={(event) => handleKeyPress(event, index)}
          ref={(el) => (inputRefs.current[index] = el)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  input: {
    width: 50,
    height: 50,
    fontSize: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    textAlign: "center",
    backgroundColor: "#fff",
  },
});

export default OTPInput;
