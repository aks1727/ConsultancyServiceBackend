import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { MentorRequest } from "../models/mentorRequest.model.js";
import { Admin } from "../models/admin.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { accessTokenOptions, refreshTokenOptions } from "../constants.js";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentors.model.js";

const generateTokens = async (adminId) => {
    try {
        const admin = await Admin.findById(adminId);
        const accessToken = admin.generateAccessToken();
        const refreshToken = admin.generateRefreshToken();

        admin.refreshToken = refreshToken;

        admin.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerAdmin = asyncHandler(async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
        throw new ApiError(404, "Missing Credentials");
    }
    const adminExist = await Admin.findOne({ username });
    if (adminExist) {
        throw new ApiError(403, "Admin already Exists");
    }
    const admin = await Admin.create({
        username,
        password,
        role,
    });

    if (!admin) {
        throw new ApiError(500, "Something went wrong while registering admin");
    }

    const finalAdmin = await Admin.findById(admin.id).select(
        "-password -refreshToken"
    );
    const { accessToken, refreshToken } = await generateTokens(admin._id);

    return res
        .status(201)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(201, admin, "Admin creation successfull"));
});

const loginAdmin = asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new ApiError(404, "Missing Credentials");
    }
    const admin = await Admin.findOne({ username }).select('+password');
    if (!admin) {
        throw new ApiError(404, `${username} is not registered`);
    }
    const isMatch = await admin.validatePassword(password);
    if (!isMatch) {
        throw new ApiError(401, "Invalid credentials");
    }
    const { accessToken, refreshToken } = await generateTokens(admin._id);
    return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(new ApiResponse(200, admin, "Login Successful"));
});

const logoutAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findByIdAndUpdate(req.admin._id, {
        $unset: {
            refreshToken: 1,
        },
    });
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    return res.status(200).json(new ApiResponse(200, {}, "Logout Successful"));
});

const getAdmin = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id).select(
        "-password -refreshToken"
    );
    if (!admin) {
        throw new ApiError(404, "Admin not found");
    }
    return res.status(200).json(new ApiResponse(200, admin, "Admin details"));
});

const getAllMentorsRequest = asyncHandler(async (req, res) => {
    const mentorRequests = await MentorRequest.aggregate([
        {
            $lookup: {
                from: "users", // Collection name in MongoDB
                localField: "userId",
                foreignField: "_id",
                as: "user",
            },
        },
        {
            $unwind: "$user", // Unwind the user array to a single document
        },
    ]);
    if (!mentorRequests) {
        throw new ApiError(404, "Mentor Requests not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { mentorRequests }, "Mentor Requests"));
});

const acceptMentorRequests = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // console.log(id);
    const mentorRequest = await MentorRequest.findById(id);
    if (!mentorRequest) {
        throw new ApiError(404, "Mentor Request not found");
    }
    const user = await User.findById(mentorRequest.userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // check if mentor exists

    const existingMentor = await Mentor.findOne({ userId: user._id });

    if (existingMentor) {
        throw new ApiError(403, "Mentor already exists for this user");
    }

    const mentor = await Mentor.create(
        {
            userId: user._id,
            linkedinProfile:mentorRequest.linkedinProfile || null,
            resumeLink:mentorRequest.resumeLink || null,
            whatsappNumber:mentorRequest.whatsappNumber,
            consultancyType:mentorRequest.consultancyType
        }
    )
    console.log(mentor)
    if (!mentor) {
        throw new ApiError(500, "Error occurred while accepting mentor request");
    }
    if (mentorRequest) {
        const d = await MentorRequest.findByIdAndDelete(mentorRequest._id)
    }
    user.isMentor = "yes";
    user.save({ validateBeforeSave: false });


    res.status(200).json(new ApiResponse(200, "Mentor Request Accepted"));
});

const rejectMentorRequests = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const mentorRequest = await MentorRequest.findByIdAndDelete(id);
    if (!mentorRequest) {
        throw new ApiError(404, "Mentor Request not found");
    }
    const user = await User.findById(mentorRequest.userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.isMentor = "no";
    user.save({ validateBeforeSave: false });
    res.status(200).json(new ApiResponse(200, "Mentor Request Rejected"));
});

export default {
    registerAdmin,
    loginAdmin,
    logoutAdmin,
    getAdmin,
    getAllMentorsRequest,
    acceptMentorRequests,
    rejectMentorRequests,
};
