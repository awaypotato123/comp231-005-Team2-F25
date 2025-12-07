import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";

// ============================================
// CREATE BOOKING (Learner books a session)
// ============================================
export const createBooking = async (req, res) => {
  try {
    const { skillId, teacherId, classId, message, preferredDate, preferredTime, duration } = req.body;
    const learnerId = req.user.id;

    // Validate required fields
    if (!skillId || !teacherId) {
      return res.status(400).json({ message: "Skill and teacher are required" });
    }

    // Check if learner has enough credits
    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    if (learner.credits < 1) {
      return res.status(400).json({ 
        message: "Insufficient credits. You need 1 credit to book a session." 
      });
    }

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Check if skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Check if learner is trying to book their own skill
    if (learnerId === teacherId) {
      return res.status(400).json({ 
        message: "You cannot book a session with yourself" 
      });
    }

    // Move credit to pending (hold it, don't spend it yet)
    learner.credits -= 1;
    learner.pendingCredits += 1;
    await learner.save();

    // Create booking
    const booking = await Booking.create({
      learnerId,
      teacherId,
      skillId,
      classId: classId || null,
      message: message || "",
      preferredDate: preferredDate || null,
      preferredTime: preferredTime || "",
      duration: duration || "1hour",
      creditCost: 1,
      status: "pending"
    });

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate("learnerId", "firstName lastName email credits pendingCredits")
      .populate("teacherId", "firstName lastName email credits")
      .populate("skillId", "title category level");

    res.status(201).json({
      message: "Booking created successfully! 1 credit moved to pending.",
      booking: populatedBooking,
      learnerCredits: {
        available: learner.credits,
        pending: learner.pendingCredits
      }
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error creating booking" });
  }
};

// ============================================
// GET MY BOOKINGS (as learner)
// ============================================
export const getMyBookingsAsLearner = async (req, res) => {
  try {
    const learnerId = req.user.id;

    const bookings = await Booking.find({ learnerId })
      .populate("teacherId", "firstName lastName email profilePicture")
      .populate("skillId", "title category level")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get learner bookings error:", error);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
};

// ============================================
// GET BOOKING REQUESTS (as teacher)
// ============================================
export const getMyBookingsAsTeacher = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const bookings = await Booking.find({ teacherId })
      .populate("learnerId", "firstName lastName email profilePicture")
      .populate("skillId", "title category level")
      .sort({ createdAt: -1 });

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Get teacher bookings error:", error);
    res.status(500).json({ message: "Server error fetching booking requests" });
  }
};

// ============================================
// GET SINGLE BOOKING
// ============================================
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findById(id)
      .populate("learnerId", "firstName lastName email profilePicture")
      .populate("teacherId", "firstName lastName email profilePicture")
      .populate("skillId", "title description category level");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is part of this booking
    if (booking.learnerId._id.toString() !== userId && 
        booking.teacherId._id.toString() !== userId) {
      return res.status(403).json({ 
        message: "You don't have permission to view this booking" 
      });
    }

    res.status(200).json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ message: "Server error fetching booking" });
  }
};

// ============================================
// ACCEPT BOOKING (Teacher accepts)
// ============================================
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { teacherResponse, meetingLink, classId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is the teacher
    if (booking.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        message: "Only the teacher can accept this booking" 
      });
    }

    // Check if booking is pending
    if (booking.status !== "pending") {
      return res.status(400).json({ 
        message: `Booking is already ${booking.status}` 
      });
    }

    // Update booking
    booking.status = "accepted";
    booking.teacherResponse = teacherResponse || "";
    booking.meetingLink = meetingLink || "";
    await booking.save();

    // If classId is provided, add student to the class
    if (classId) {
      const Class = (await import("../models/classModel.js")).default;
      const classData = await Class.findById(classId);
      
      if (classData) {
        // Add student to class if not already enrolled
        if (!classData.students.includes(booking.learnerId)) {
          classData.students.push(booking.learnerId);
          await classData.save();
        }
      }
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate("learnerId", "firstName lastName email")
      .populate("teacherId", "firstName lastName email")
      .populate("skillId", "title category level");

    res.status(200).json({
      message: "Booking accepted successfully! Student added to class.",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Accept booking error:", error);
    res.status(500).json({ message: "Server error accepting booking" });
  }
};

// ============================================
// REJECT BOOKING (Teacher rejects)
// ============================================
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { teacherResponse } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is the teacher
    if (booking.teacherId.toString() !== teacherId) {
      return res.status(403).json({ 
        message: "Only the teacher can reject this booking" 
      });
    }

    // Check if booking is pending
    if (booking.status !== "pending") {
      return res.status(400).json({ 
        message: `Booking is already ${booking.status}` 
      });
    }

    // Refund credit from pending back to available
    const learner = await User.findById(booking.learnerId);
    if (learner) {
      learner.credits += 1;           // Return to available
      learner.pendingCredits -= 1;    // Remove from pending
      await learner.save();
    }

    // Update booking
    booking.status = "rejected";
    booking.teacherResponse = teacherResponse || "";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("learnerId", "firstName lastName email credits pendingCredits")
      .populate("teacherId", "firstName lastName email")
      .populate("skillId", "title category level");

    res.status(200).json({
      message: "Booking rejected. Credit refunded to learner.",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Reject booking error:", error);
    res.status(500).json({ message: "Server error rejecting booking" });
  }
};

// ============================================
// COMPLETE BOOKING (Mark as completed)
// ============================================
export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { meetingNotes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is part of this booking
    if (booking.learnerId.toString() !== userId && 
        booking.teacherId.toString() !== userId) {
      return res.status(403).json({ 
        message: "Only the learner or teacher can complete this booking" 
      });
    }

    // Check if booking is accepted
    if (booking.status !== "accepted") {
      return res.status(400).json({ 
        message: "Only accepted bookings can be completed" 
      });
    }

    // CRITICAL: Transfer credit from learner's pending to teacher's available
    const learner = await User.findById(booking.learnerId);
    const teacher = await User.findById(booking.teacherId);

    if (learner && teacher) {
      // Remove from learner's pending (credit is now spent)
      learner.pendingCredits -= 1;
      await learner.save();

      // Add to teacher's available credits (they earned it!)
      teacher.credits += 1;
      await teacher.save();
    }

    // Update booking
    booking.status = "completed";
    if (meetingNotes) {
      booking.meetingNotes = meetingNotes;
    }
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("learnerId", "firstName lastName email credits pendingCredits")
      .populate("teacherId", "firstName lastName email credits")
      .populate("skillId", "title category level");

    res.status(200).json({
      message: "Session completed! Teacher earned 1 credit.",
      booking: populatedBooking,
      learnerCredits: {
        available: learner.credits,
        pending: learner.pendingCredits
      },
      teacherCredits: {
        available: teacher.credits
      }
    });
  } catch (error) {
    console.error("Complete booking error:", error);
    res.status(500).json({ message: "Server error completing booking" });
  }
};

// ============================================
// CANCEL BOOKING (Learner cancels)
// ============================================
export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const learnerId = req.user.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check if user is the learner
    if (booking.learnerId.toString() !== learnerId) {
      return res.status(403).json({ 
        message: "Only the learner can cancel this booking" 
      });
    }

    // Check if booking can be cancelled
    if (booking.status === "completed") {
      return res.status(400).json({ 
        message: "Cannot cancel a completed booking" 
      });
    }

    // Refund credit from pending if booking was pending or accepted
    if (booking.status === "pending" || booking.status === "accepted") {
      const learner = await User.findById(learnerId);
      if (learner) {
        learner.credits += 1;           // Return to available
        learner.pendingCredits -= 1;    // Remove from pending
        await learner.save();
      }
    }

    // Update booking
    booking.status = "cancelled";
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate("learnerId", "firstName lastName email credits pendingCredits")
      .populate("teacherId", "firstName lastName email")
      .populate("skillId", "title category level");

    res.status(200).json({
      message: "Booking cancelled. Credit refunded.",
      booking: populatedBooking
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ message: "Server error cancelling booking" });
  }
};

// ============================================
// GET BOOKING STATS (for dashboard)
// ============================================
export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // As learner
    const asLearner = {
      total: await Booking.countDocuments({ learnerId: userId }),
      pending: await Booking.countDocuments({ learnerId: userId, status: "pending" }),
      accepted: await Booking.countDocuments({ learnerId: userId, status: "accepted" }),
      completed: await Booking.countDocuments({ learnerId: userId, status: "completed" })
    };

    // As teacher
    const asTeacher = {
      total: await Booking.countDocuments({ teacherId: userId }),
      pending: await Booking.countDocuments({ teacherId: userId, status: "pending" }),
      accepted: await Booking.countDocuments({ teacherId: userId, status: "accepted" }),
      completed: await Booking.countDocuments({ teacherId: userId, status: "completed" })
    };

    res.status(200).json({
      asLearner,
      asTeacher
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({ message: "Server error fetching booking stats" });
  }
};