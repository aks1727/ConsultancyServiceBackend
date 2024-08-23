import { Message } from "../models/message.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Mentor } from "../models/mentors.model.js";
import { Chat } from "../models/chats.model.js";

const allMessages = asyncHandler(async (req, res) => {
    const { chatId } = req.params
    if (!chatId) {
        throw new ApiError(400, "Chat ID required");
    }
    const messages = await Message.find({ chat: chatId })
        .populate("sender", "name avatar email")
    if (!messages) {
        throw new ApiError(404, "No messages found");
    }
    return res.status(200).json(new ApiResponse(200, messages, "Messages found"));
})

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        throw new ApiError(400, "Missing required fields");
    }

    let message = await Message.create({
        sender: req.user._id,
        content,
        chat: chatId,
    });

    message = await message.populate("sender", "name avatar");
    message = await message.populate("chat");

    message = await Mentor.populate(message, {
        path: "chat.mentorId",
        select: "userId",
    });
    message = await User.populate(message, {
        path: "chat.mentorId.userId",
        select: "name avatar",
    });
    message = await User.populate(message, {
        path: "chat.userId",
        select: "name avatar",
    });

    
    
    if (!message) {
        throw new ApiError(500, "Failed to send message");
    }
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

    return res
        .status(200)
        .json(new ApiResponse(200, message, "Message sent successfully"));
});

export default {
    allMessages,
    sendMessage,
};
