import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema({
  like: { type: Number, default: 0 },
  heart: { type: Number, default: 0 },
  laugh: { type: Number, default: 0 },
  wow: { type: Number, default: 0 }
});

const ClassPostSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },

  reactions: { 
    type: ReactionSchema, 
    default: () => ({ like: 0, heart: 0, laugh: 0, wow: 0 })
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ClassPost", ClassPostSchema);
