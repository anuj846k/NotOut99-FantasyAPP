import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.models.js";
import { sendOtp, verifyOtp } from "../utils/otpService.js";

const createUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, phoneNumber, referralCode } = req.body;

    if ([firstName, lastName, phoneNumber].some((field) => field === "")) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "All fields are required"));
    }

    const existedUser = await User.findOne({ phoneNumber });

    if (existedUser) {
        return res
            .status(409)
            .json(new ApiResponse(
                409, 
                { isRegistered: true }, 
                "User already exists with this phone number. Please login instead."
            ));
    }

    try {
        const user = await User.create({
            firstName,
            lastName,
            phoneNumber,
            referralCode,
        });

        return res
            .status(201)
            .json(new ApiResponse(201, { isRegistered: false, user }, "User registered successfully"));
    } catch (error) {
        console.error("Registration error:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to register user. Please try again."));
    }
});

const requestOtp = asyncHandler(async (req, res) => {
    const { phoneNumber, isRegistration } = req.body;

    if (!phoneNumber) {
        return res
            .status(400)
            .json(new ApiResponse(400, null, "Phone number is required"));
    }

    const user = await User.findOne({ phoneNumber });

    if (isRegistration) {
        if (user) {
            return res
                .status(409)
                .json(new ApiResponse(
                    409, 
                    null, 
                    "User already registered with this phone number. Please login instead."
                ));
        }
    }
    else {
        if (!user) {
            return res
                .status(404)
                .json(new ApiResponse(
                    404, 
                    null, 
                    "User not found. Please register first."
                ));
        }
    }

    try {
        const otpSent = await sendOtp(phoneNumber);
        if (!otpSent) {
            return res
                .status(500)
                .json(new ApiResponse(500, null, "Failed to send OTP"));
        }

        return res
            .status(200)
            .json(new ApiResponse(200, null, "OTP sent successfully"));
    } catch (error) {
        console.error("OTP send error:", error);
        return res
            .status(500)
            .json(new ApiResponse(500, null, "Failed to process OTP request"));
    }
});

const verifyLogin = asyncHandler(async (req, res) => {
    const { otp, phoneNumber } = req.body;

    if (!phoneNumber) {
        throw new ApiError(400, "Phone number is required");
    }

    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    const isOtpValid = await verifyOtp(phoneNumber, otp);
    if (!isOtpValid) {
        throw new ApiError(401, "Invalid or expired OTP");
    }

    let user = await User.findOne({ phoneNumber });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    if (!accessToken || !refreshToken) {
        console.error("Failed to generate tokens", {
            userId: user._id,
            accessTokenGenerated: !!accessToken,
            refreshTokenGenerated: !!refreshToken,
        });
        throw new ApiError(500, "Failed to generate authentication tokens");
    }

    return res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Login successful",
        data: {
            _id: user._id,
            phoneNumber: user.phoneNumber,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            accessToken: accessToken,
            refreshToken: refreshToken,
        },
    });
});

export { createUser, requestOtp, verifyLogin };
