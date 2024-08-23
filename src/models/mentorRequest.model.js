import mongoose from "mongoose";
import { Schema } from "mongoose";
const mentorRequestSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        linkedinProfile: {
            type: String,
        },
        resumeLink: {
            type: String,
        },
        whatsappNumber: {
            type: String,
            required: true,
        },
        consultancyType: {
            type: String,
            enum: [
                "Career Consultant",
                "Fitness Coach",
                "Exam/College Consultancy",
                "Freelancer Consultant",
                "HealthCare Consultant",
                "Business Consultant",
                "Social Media Consultant",
                "Financial Consultant",
            ],
            required:true
        },
    },
    { timestamps: true }
);



export const MentorRequest = mongoose.model("MentorRequest",mentorRequestSchema);