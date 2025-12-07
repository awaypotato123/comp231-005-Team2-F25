import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Skill from "../models/Skill.js";

export const createBooking = async (req, res) => {
  try {
    const { skillId, teacherId, classId, message, preferredDate, preferredTime, duration } = req.body;
    const learnerId = req.user.id;

    if (!skillId || !teacherId) {
      return res.status(400).json({ message: "Skill and teacher are required" });
    }

    const learner = await User.findById(learnerId);
    if (!learner) {
      return res.status(404).json({ message: "Learner not found" });
    }

    if (learner.credits < 1) {
      return res.status(400).json({
        message: "Insufficient credits. You need 1 credit to book a session."
      });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    if (learnerId === teacherId) {
      return res.status(400).json({
        message: "You cannot book a session with yourself"
      });
    }

    learner.credits -= 1;
    learner.pendingCredits += 1;
    await learner.save();

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

export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { teacherResponse, meetingLink, classId } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        message: "Only the teacher can accept this booking"
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Booking is already ${booking.status}`
      });
    }

    booking.status = "accepted";
    booking.teacherResponse = teacherResponse || "";
    booking.meetingLink = meetingLink || "";
    await booking.save();

    if (classId) {
      const Class = (await import("../models/classModel.js")).default;
      const classData = await Class.findById(classId);

      if (classData) {

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

export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    const { teacherResponse } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.teacherId.toString() !== teacherId) {
      return res.status(403).json({
        message: "Only the teacher can reject this booking"
      });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({
        message: `Booking is already ${booking.status}`
      });
    }

    const learner = await User.findById(booking.learnerId);
    if (learner) {
      learner.credits += 1;
      learner.pendingCredits -= 1;
      await learner.save();
    }

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

export const completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { meetingNotes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.learnerId.toString() !== userId &&
        booking.teacherId.toString() !== userId) {
      return res.status(403).json({
        message: "Only the learner or teacher can complete this booking"
      });
    }

    if (booking.status !== "accepted") {
      return res.status(400).json({
        message: "Only accepted bookings can be completed"
      });
    }

    const learner = await User.findById(booking.learnerId);
    const teacher = await User.findById(booking.teacherId);

    if (learner && teacher) {

      learner.pendingCredits -= 1;
      await learner.save();

      teacher.credits += 1;
      await teacher.save();
    }

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

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const learnerId = req.user.id;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.learnerId.toString() !== learnerId) {
      return res.status(403).json({
        message: "Only the learner can cancel this booking"
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        message: "Cannot cancel a completed booking"
      });
    }

    if (booking.status === "pending" || booking.status === "accepted") {
      const learner = await User.findById(learnerId);
      if (learner) {
        learner.credits += 1;
        learner.pendingCredits -= 1;
        await learner.save();
      }
    }

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

export const getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const asLearner = {
      total: await Booking.countDocuments({ learnerId: userId }),
      pending: await Booking.countDocuments({ learnerId: userId, status: "pending" }),
      accepted: await Booking.countDocuments({ learnerId: userId, status: "accepted" }),
      completed: await Booking.countDocuments({ learnerId: userId, status: "completed" })
    };

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