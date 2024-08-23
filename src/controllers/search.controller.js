import { User } from "../models/user.model.js"
import { Mentor } from "../models/mentors.model.js"
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";


const searchMentors = asyncHandler(async (req, res) => {
    
    const { value } = req.query
    if (!value) {
        throw new ApiError(400, "Search term required");
    }

    const term = new RegExp(value, "i"); // Case-insensitive search
    // TODO:  make so that if the user name is searched and if he is mentor he's details should be shown not only through the consultancy type
    const userResults = await User.find({
        $or: [
            { name: { $regex: term } },
            { username: { $regex: term } },
            { email: { $regex: term } },
            { skills: { $regex: term } },
            { bio: { $regex: term } },
        ],
    });

    // Search in Mentor model
    const mentorResults = await Mentor.find({
        consultancyType: { $regex: term },
    }).populate("userId", "name username email avatar bio skills"); // populate user details

    // console.log(mentorResults)
    // Format and merge results
    const combinedResults = [
        ...mentorResults.map((mentor) => ({
            type: "mentor",
            data: mentor,
        })),
    ];

    return res.status(200)
        .json(
        new ApiResponse(200, combinedResults, "Search Results")
    )

})

export default {
    searchMentors,
}