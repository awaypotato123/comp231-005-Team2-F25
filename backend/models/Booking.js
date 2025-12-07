import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({

  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true
  },

  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null
  },

  message: {
    type: String,
    maxlength: 500,
    default: ""
  },
  preferredDate: {
    type: Date,
    default: null
  },
  preferredTime: {
    type: String,
    default: ""
  },
  duration: {
    type: String,
    enum: ["30min", "1hour", "2hours", "3hours"],
    default: "1hour"
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending"
  },

  creditCost: {
    type: Number,
    default: 1
  },

  teacherResponse: {
    type: String,
    maxlength: 500,
    default: ""
  },

  meetingLink: {
    type: String,
    default: ""
  },
  meetingNotes: {
    type: String,
    maxlength: 1000,
    default: ""
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Booking", BookingSchema);