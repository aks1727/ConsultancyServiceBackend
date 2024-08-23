import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema(
    {
        mentorId: {
            type: Schema.Types.ObjectId,
            ref: "Mentor", // Reference to the User model
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        chatName: {
            type: String,
            trim: true
        },
        latestMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
    },
    { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
