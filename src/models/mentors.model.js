import mongoose, { Schema } from "mongoose";

const mentorSchema = new Schema({
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
    sessionsTaken: {
        type: Number,
        default: 0,
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
            "Financial Consultant"
        ],
    },
    ratings: {
        type: [Number],
        default: [],
    }
});

export const Mentor = mongoose.model("Mentor", mentorSchema);