import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Admin } from "../models/admin.models.js";

const generateAccessAndRefreshToken = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating access and refresh Token"
        );
    }
};

const createAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if ([username, password].some((fields) => fields === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedAdmin = await Admin.findOne({
        $or: [{ username }],
    });

    if (existedAdmin) {
        throw new ApiError(409, "Admin already registered");
    }

    const admin = await Admin.create({ username, password });

    return res
        .status(201)
        .json(new ApiResponse(200, admin, "Admin has been created"));
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        throw new ApiError(400, "username is required");
    }

    const admin = await Admin.findOne({
        $or: [{ username }],
    });

    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(404, "Incorrect Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        admin._id
    );

    const loggedInAdmin = await Admin.findById(admin.id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { admin: loggedInAdmin, accessToken, refreshToken },
                "Admin loggedIn Successfully"
            )
        );
});

export { createAdmin, loginAdmin };
