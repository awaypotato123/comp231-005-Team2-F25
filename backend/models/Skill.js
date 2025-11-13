import mongoose from "mongoose";

const skillSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    category: {
        type: String,
        trim: true,
        enum: ["Creative", "Business", "Technology", "Language", "Communication", "Culinary", "Science", "Trades", "Fitness",
            "Gaming", "Education", "Other"
        ],
        default: "Other",
    },
    level: {
        type: String,
        required: true,
        enum: ["beginner", "intermediate", "advanced"],
        default: "beginner",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
{timestamps: true}
);

export default mongoose.model("Skill", skillSchema);