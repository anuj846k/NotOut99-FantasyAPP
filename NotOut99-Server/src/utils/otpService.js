import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

// Initialize Twilio Client
const twilioClient = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const OTP_EXPIRATION = 300000; // 5 minutes in milliseconds
const otpStore = new Map(); // In-memory storage

export const sendOtp = async (phoneNumber) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + OTP_EXPIRATION;

    try {
        // Send OTP via Twilio
        await twilioClient.messages.create({
            body: `Your OTP code is ${otp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
        });

        // Store OTP in memory with expiration
        otpStore.set(phoneNumber, { otp, expiry });

        return true;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return false;
    }
};

export const verifyOtp = async (phoneNumber, otp) => {
    console.log("Verifying OTP", { phoneNumber, otp });
    const otpData = otpStore.get(phoneNumber);
    console.log("Stored OTP data:", otpData);
    if (!otpData) {
        console.log("No OTP found for phone number");
        return false; // No OTP stored for this number
    }

    const { otp: storedOtp, expiry } = otpData;
    console.log("OTP validation:", {
        storedOtp,
        expiry,
        currentTime: Date.now(),
        isExpired: Date.now() > expiry,
        matches: storedOtp === otp,
    });
    if (Date.now() > expiry || storedOtp !== otp) {
        otpStore.delete(phoneNumber); // Remove expired or incorrect OTP
        return false;
    }

    // OTP is correct, remove it after verification
    otpStore.delete(phoneNumber);
    return true;
};

// Cleanup expired OTPs periodically
setInterval(() => {
    const now = Date.now();
    otpStore.forEach((value, key) => {
        if (value.expiry < now) {
            otpStore.delete(key);
        }
    });
}, 60000); // Runs every 1 minute
