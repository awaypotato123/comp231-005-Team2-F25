import mongoose from "mongoose";


const requestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    requestedAt: {
        type: Date,
        default: Date.now,
    },
});

const skillSchema = new mongoose.Schema(
    {
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
        
        pendingRequests: [requestSchema],
    },
    { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);
