import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  // The learner who is booking the session
  learnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // The teacher who will teach
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // The skill being taught
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true
  },
  // The class (optional - for class-based bookings)
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    default: null
  },
  // Booking details
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
  // Status tracking
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending"
  },
  // Credit cost (1 credit per booking)
  creditCost: {
    type: Number,
    default: 1
  },
  // Teacher's response
  teacherResponse: {
    type: String,
    maxlength: 500,
    default: ""
  },
  // Meeting details (added after acceptance)
  meetingLink: {
    type: String,
    default: ""
  },
  meetingNotes: {
    type: String,
    maxlength: 1000,
    default: ""
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp on save
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("Booking", BookingSchema);