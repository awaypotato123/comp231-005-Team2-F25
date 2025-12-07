import User from "../models/User.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password -salt")
      .populate("skills", "title category level");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, profilePicture } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    const updatedUser = await user.save();

    const safeUser = updatedUser.toObject();
    delete safeUser.password;
    delete safeUser.salt;

    res.status(200).json({
      message: "Profile updated successfully",
      user: safeUser
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error updating profile" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Please provide current and new password"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = user.authenticate(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Server error updating password" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select("credits skills")
      .populate("skills");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const stats = {
      credits: user.credits,
      totalSkills: user.skills.length,
      skillsByLevel: {
        beginner: user.skills.filter(s => s.level === "beginner").length,
        intermediate: user.skills.filter(s => s.level === "intermediate").length,
        advanced: user.skills.filter(s => s.level === "advanced").length
      }
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};

export const getPublicUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .select("firstName lastName email bio profilePicture credits createdAt")
      .populate("skills", "title category level");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Public user fetch error", error);
    return res.status(500).json({ message: "Server error fetching public user" });
  }
};

export const updateUserCreds = async (req, res) => {
  try {
    const userId = req.user.id;
    const { credits } = req.body;

    if (credits === undefined || isNaN(credits)) {
      return res.status(400).json({ message: "Invalid or missing credit value" });
    }

    if (credits < 0) {
      return res.status(400).json({ message: "Credits cannot be negative" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { credits },
      { new: true }
    ).select("credits");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Credits updated successfully",
      credits: updatedUser.credits
    });

  } catch (error) {
    console.error("Update credits error:", error);
    res.status(500).json({ message: "Server error updating credits" });
  }
};

export const updateCreditsById = async (req, res) => {
  try {
    const { userId, credits } = req.body;

    if (!userId || credits === undefined || isNaN(credits)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { credits } },
      { new: true }
    ).select("credits");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Instructor credits updated successfully",
      credits: updatedUser.credits
    });

  } catch (error) {
    console.error("Instructor credit update error:", error);
    res.status(500).json({ message: "Server error updating instructor credits" });
  }
};
