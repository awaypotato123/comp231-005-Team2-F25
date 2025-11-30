import User from "../models/User.js";
import Skill from "../models/Skill.js";


export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;

   
    let query = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    
    const users = await User.find(query)
      .select("-password -salt")
      .populate("skills", "title category level")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -salt")
      .populate("skills");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
};


export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    if (!["learner", "teacher", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password -salt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Server error updating user role" });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    
    if (userId === req.user.id) {
      return res.status(400).json({ 
        message: "You cannot delete your own account" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    await Skill.deleteMany({ userId: userId });

    
    await User.findByIdAndDelete(userId);

    res.status(200).json({ 
      message: "User and associated skills deleted successfully" 
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
};


export const suspendUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { credits: 0 },
      { new: true }
    ).select("-password -salt");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User suspended successfully",
      user
    });
  } catch (error) {
    console.error("Suspend user error:", error);
    res.status(500).json({ message: "Server error suspending user" });
  }
};


export const addCreditsToUser = async (req, res) => {
  try {
    const { credits } = req.body;
    const userId = req.params.id;

    if (!credits || credits <= 0) {
      return res.status(400).json({ message: "Invalid credit amount" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.credits += credits;
    await user.save();

    res.status(200).json({
      message: `Added ${credits} credits successfully`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        credits: user.credits
      }
    });
  } catch (error) {
    console.error("Add credits error:", error);
    res.status(500).json({ message: "Server error adding credits" });
  }
};

// Reset user password
export const resetUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.params.id;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password reset successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error resetting password" });
  }
};


export const getAllSkillsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, level, search } = req.query;

    // Build query
    let query = {};
    
    if (category) {
      query.category = category;
    }

    if (level) {
      query.level = level;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Execute query with pagination
    const skills = await Skill.find(query)
      .populate("userId", "firstName lastName email role")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Skill.countDocuments(query);

    res.status(200).json({
      skills,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalSkills: count
    });
  } catch (error) {
    console.error("Get all skills (admin) error:", error);
    res.status(500).json({ message: "Server error fetching skills" });
  }
};

// Delete skill (admin)
export const deleteSkillAdmin = async (req, res) => {
  try {
    const skillId = req.params.id;

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // Remove skill from user's skills array
    await User.findByIdAndUpdate(skill.userId, {
      $pull: { skills: skillId }
    });

    // Delete the skill
    await Skill.findByIdAndDelete(skillId);

    res.status(200).json({ 
      message: "Skill deleted successfully" 
    });
  } catch (error) {
    console.error("Delete skill (admin) error:", error);
    res.status(500).json({ message: "Server error deleting skill" });
  }
};



export const getAdminStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalSkills = await Skill.countDocuments();
    const totalLearners = await User.countDocuments({ role: "learner" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalAdmins = await User.countDocuments({ role: "admin" });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get recent skills (last 7 days)
    const recentSkills = await Skill.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    
    const skillsByCategory = await Skill.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    
    const skillsByLevel = await Skill.aggregate([
      {
        $group: {
          _id: "$level",
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalSkills,
        totalLearners,
        totalTeachers,
        totalAdmins,
        recentUsers,
        recentSkills,
        skillsByCategory,
        skillsByLevel
      }
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    res.status(500).json({ message: "Server error fetching stats" });
  }
};