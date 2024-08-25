import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { MentorRequest } from "../models/mentorRequest.model.js";

// console.log("user controller")
const accessTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 24 * 60 * 60 * 1000,
};
5;
const refreshTokenOptions = {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    maxAge: 30 * 24 * 60 * 60 * 1000,
};

const generateTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};
// basic authentication methods for user
const registerUser = asyncHandler(async (req, res) => {
    const { email, username, name, phoneNumber, password } = req.body;
    if (!email || !username || !password || !phoneNumber || !name) {
        throw new ApiError(404, "Missing Credentials");
    }
    const emailExist = await User.findOne({ email });
    if (emailExist) {
        throw new ApiError(403, "Email already registered with other user");
    }
    const usernameExist = await User.findOne({ username });
    if (usernameExist) {
        throw new ApiError(403, "Username already registered with other user");
    }
    const userExist = await User.findOne({ phoneNumber });
    if (userExist) {
        throw new ApiError(
            403,
            "Phone Number already registered with other user"
        );
    }
    const user = await User.create({
        name,
        email,
        password,
        phoneNumber,
        username,
    });
    if (!user) {
        throw new ApiError(500, "Error occured while Registering user user");
    }
    const { accessToken, refreshToken } = await generateTokens(user._id);
    const finalUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, finalUser, "User creation Success"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(404, "Missing Credentials");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not Found");
    }
    const isPass = await user.isPasswordCorrect(password)
    if (!isPass) {
        throw new ApiError(400, "Passwords do not match");
    }
    const finalUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    const { accessToken, refreshToken } = await generateTokens(user._id);
    return res
        .status(201)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(201, finalUser, "User Login Success"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    return res
        .status(202)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(202, {}, "User logged out"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (!email || !newPassword || !confirmPassword) {
        throw new ApiError(404, "Missing Credentials");
    }
    if (newPassword !== confirmPassword) {
        throw new ApiError(406, "password didn't matched");
    }
    const user = await User.findOne({ email });
    
    if (!user) {
        throw new ApiError(404,"User not found with the email id check information correctly");
    }

    user.password = newPassword;
    user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(201, {}, "Password updated"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(201, req.user, "Success"));
});

const getUserByusername = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        throw new ApiError(404, "Missing Credentials");
    }
    const user = await User.findOne({ username: username }).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return res.status(200).json(new ApiResponse(201, user, "Users found"));
});

// updation methods for user

const updateProfile = asyncHandler(async (req, res) => {
    const { name, username, email, phoneNumber, bio, gender } = req.body;

    if (!name || !username || !email || !phoneNumber || !bio || !gender) {
        throw new ApiError(404, "Missing Credentials");
    }

    const userEmail = await User.findOne({ email });
    const userUsername = await User.findOne({ username });
    const userPhoneNumber = await User.findOne({ phoneNumber });

    if (userEmail && userEmail?._id.toString() !== req?.user._id.toString()) {
        throw new ApiError(403, "Email registered with other user");
    }
    if (
        userUsername &&
        userUsername?._id.toString() !== req?.user._id.toString()
    ) {
        throw new ApiError(403, "Username registered with other user");
    }
    if (
        userPhoneNumber &&
        userPhoneNumber?._id.toString() !== req?.user._id.toString()
    ) {
        throw new ApiError(403, "Phone Number registered with other user");
    }

    let avatar = userEmail.avatar;

    if (req.file) {
        // Convert the file buffer to a base64 string for Cloudinary
        const avatarBuffer = req.file.buffer.toString("base64");

        // Upload to Cloudinary (assuming uploadOnCloudinary handles base64 data)
        const uploadResponse = await uploadOnCloudinary(avatarBuffer);

        if (!uploadResponse?.url) {
            throw new ApiError(404, "Error uploading avatar to Cloudinary");
        }
        avatar = uploadResponse.url;
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                name,
                username,
                email,
                phoneNumber,
                bio,
                gender,
                avatar,
            },
        },
        {
            new: true,
        }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(
            500,
            "Error occurred while updating profile details"
        );
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Profile details updated"));
});

const updateSkillsDetails = asyncHandler(async (req, res) => {
    const { skills } = req.body;
    console.log(skills);

    if (!skills || !Array.isArray(skills)) {
        throw new ApiError(404, "Missing Credentials");
    }

    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.skills = skills;
    user.save({ validateBeforeSave: false });

    const updatedUser = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );

    if (!updatedUser) {
        throw new ApiError(500, "Error occurred while updating skills details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Skills details updated"));
});

const updateEducationDetails = asyncHandler(async (req, res) => {
    const { education } = req.body;

    if (!education || !Array.isArray(education)) {
        throw new ApiError(404, "Missing Credentials");
    }

    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.educations = education.map((edu) => {
        const fromDate = new Date(edu.from);
        const toDate = new Date(edu.to);

        if (!fromDate.getTime() || !toDate.getTime()) {
            throw new ApiError(400, "Invalid date format. Use 'DD/MM/YYYY'.");
        }

        return {
            ...edu,
            from: fromDate,
            to: toDate,
        };
    });
    user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Education details updated"));
});

const updateAchievements = asyncHandler(async (req, res) => {
    const { achievementDetails } = req.body;
    if (!achievementDetails || !Array.isArray(achievementDetails)) {
        throw new ApiError(404, "Missing Credentials");
    }
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.achievements = achievementDetails.map((ach) => {
        const date = new Date(ach.date);
        if (!date.getTime()) {
            throw new ApiError(400, "Invalid date format. Use 'DD/MM/YYYY'.");
        }
        return {
            ...ach,
            date: date,
        };
    });
    user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Achievements details updated"));
});

const updateExperienceDetails = asyncHandler(async (req, res) => {
    const { experienceDetails } = req.body;
    if (!experienceDetails || !Array.isArray(experienceDetails)) {
        throw new ApiError(404, "Missing Credentials");
    }
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }
    user.experiences = experienceDetails.map((exp) => {
        const working = Boolean(exp.isWorking);

        return {
            ...exp,
            isWorking: working,
        };
    });
    user.save({ validateBeforeSave: false });
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Experience details updated"));
});

const submitMentorRegistrationForm = asyncHandler(async (req, res) => {
    const { consultancyType, linkedinProfile, resumeLink, whatsappNumber } =
        req.body;
    console.log(linkedinProfile, typeof resumeLink, whatsappNumber);
    if (!whatsappNumber || !consultancyType) {
        throw new ApiError(404, "Missing Credentials");
    }
    const user = await User.findById(req.user._id).select(
        "-password -refreshToken"
    );
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    if (user.isMentor === "pending") {
        throw new ApiError(
            403,
            "You have already submitted a mentor registration request"
        );
    }
    user.isMentor = "pending";
    user.save({ validateBeforeSave: false });

    const mentorRequest = await MentorRequest.create({
        userId: user._id,
        linkedinProfile,
        resumeLink,
        whatsappNumber,
        consultancyType,
    });
    if (!mentorRequest) {
        throw new ApiError(
            500,
            "Error occurred while submitting mentor registration request"
        );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(201, user, "Mentor Registration Request submitted")
        );
});

export default {
    // basic authentication
    registerUser,
    loginUser,
    logoutUser,
    changeUserPassword,
    getCurrentUser,
    getUserByusername,

    // updation methods
    updateEducationDetails,
    updateExperienceDetails,
    updateSkillsDetails,
    updateAchievements,
    updateProfile,
    submitMentorRegistrationForm,
};
