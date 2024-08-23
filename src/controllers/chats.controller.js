import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Chat } from "../models/chats.model.js";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentors.model.js";
import { Message } from "../models/message.model.js";

const accessMentorChat = asyncHandler(async (req, res) => {
    const { mentorId } = req.params;
    if (!mentorId) {
        throw new ApiError(403, "Mentor ID required");
    }

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
        throw new ApiError(404, "Mentor Id was wrong");
    }

    const user = await Mentor.findOne({ userId: req.user._id });

    if (user) {
        throw new ApiError(403, "Mentor can't chat with mentors");
    }

    let isChat = await Chat.findOne({
        mentorId: mentorId,
        userId: req.user._id,
    })
        .populate("mentorId", "userId")
        .populate("userId", "name avatar email")
        .populate("latestMessage");
    // console.log("isChat", isChat)

    // console.log("chat", isChat)

    isChat = await User.populate(isChat, {
        path: "mentorId.userId",
        select: "name avatar email",
    });

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name avatar email",
    });

    if (isChat === null || isChat.length <= 0) {
        // const user = await User.findById(req.user._id).select("name");
        // console.log(user)
        let chat = await Chat.create({
            chatName: "sender",
            mentorId: mentorId,
            userId: req.user._id,
        });

        chat = await Chat.populate(chat, {
            path: "mentorId",
            select: "userId",
        })
            
        chat = await Chat.populate(chat, {
                path: "mentorId.userId",
                select: "name avatar email",
            })
        chat = await Chat.populate(chat, {
            path: "userId",
            select: "name avatar email"
        })       
        
        chat= await User.populate(chat, {
            path: "mentorId.userId",
            select: "name avatar email",
        });

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name avatar email",
        });

        if (!chat) {
            throw new ApiError(500, "Failed to create chat");
        }
        return res
            .status(201)
            .json(new ApiResponse(201, chat, "Chat created successfully"));
    }
    // console.log(isChat)
    return res.status(200).json(new ApiResponse(200, isChat, "Chat found"));
});

const accessUserChat = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "user ID required");
    }
    console.log(req.user);
    const mentor = await Mentor.findOne({ userId: req.user._id });
    console.log(mentor);
    if (!mentor) {
        throw new ApiError(404, "Access denied! Mentors can access this");
    }

    let isChat = await Chat.findOne({
        mentorId: mentorId,
        userId: req.user._id,
    })
        .populate("mentorId", "userId")
        .populate("userId", "name avatar email")
        .populate("latestMessage");
    // console.log("isChat", isChat)

    // console.log("chat", isChat)

    isChat = await User.populate(isChat, {
        path: "mentorId.userId",
        select: "name avatar email",
    });

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name avatar email",
    });

    if (isChat === null || isChat <= 0) {
        return res.status(404).json(new ApiResponse(404, "No chat found"));
    }

    return res.status(200).json(new ApiResponse(200, isChat, "Chat found"));
});
const fetchChatsforMentor = asyncHandler(async (req, res) => {
    const mentor = await Mentor.findOne({ userId: req.user._id });

    if (!mentor) {
        throw new ApiError(403, "Access denied! Only mentors can access this");
    }

    let results = await Chat.find({ mentorId: mentor._id })
        .populate({
            path: "mentorId",
            populate: {
                path: "userId",
                select: "name avatar email",
            },
        })
        .populate("userId", "name avatar email")
        .populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name avatar email",
            },
        })
        .sort({ updatedAt: -1 });

    if (results.length <= 0) {
        throw new ApiError(404, "No chats found");
    }

    res.status(200).json(
        new ApiResponse(200, results, "Chats fetched successfully")
    );
});
export default {
    accessMentorChat,
    accessUserChat,
    fetchChatsforMentor,
};
