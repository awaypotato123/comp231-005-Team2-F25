import Skill from "../models/Skill.js";
import User from "../models/User.js";

//Get all skills
export const getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate("userId", "firstName lastName email");
    res.status(200).json(skills);
  } catch (err) {
    console.error("Error fetching skills:", err);
    res.status(500).json({ message: "Server error fetching skills" });
  }
};

//Create a Skill
export const createSkill = async (req, res) => {
  try {
    const { title, description, category, level } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized - user not logged in" });
    }

    const skill = new Skill({
      title,
      description,
      category,
      level,
      userId,
      status: "pending"
    });

    const savedSkill = await skill.save();

    //Link the new skill to the user
    await User.findByIdAndUpdate(userId, { $push: { skills: savedSkill._id } });

    res.status(201).json({
      message: "Skill created successfully",
      skill: savedSkill,
    });
  } catch (err) {
    console.error("Error creating skill:", err);
    res.status(500).json({ message: "Server error creating skill" });
  }
};

//Update skill
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedSkill = await Skill.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json({
      message: "Skill updated successfully",
      skill: updatedSkill,
    });
  } catch (err) {
    console.error("Error updating skill:", err);
    res.status(500).json({ message: "Server error updating skill" });
  }
};

//Delete skill
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSkill = await Skill.findByIdAndDelete(id);
    if (!deletedSkill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    //Remove from user's skills list
    await User.findByIdAndUpdate(deletedSkill.userId, {
      $pull: { skills: deletedSkill._id },
    });

    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (err) {
    console.error("Error deleting skill:", err);
    res.status(500).json({ message: "Server error deleting skill" });
  }
};

//Get skills pending approval
export const getPendingSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ status: "pending" }).populate("userId", "firstName lastName email");

    res.status(200).json(skills)
  } catch (err) {
    console.error("Error fetching skills awaiting approval:", err);
    res.status(500).json({ message: "Server error fetching skills awaiting approval" });
  }
}

//Approve Skill
export const approveSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true}
    );

    if (!skill) {
      return res.status(404).json({ message: "Skill not found"});
    }

    res.status(200).json({
      message: "Skill approved",
      skill
    });
  } catch (err) {
    console.error("Error approving skill:", err);
    res.status(500).json({ message: "Server error approving skill" });
  }
}

export const rejectSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true}
    );

    if (!skill) {
      return res.status(404).json({ message: "Skill not found"});
    }

    res.status(200).json({
      message: "Skill rejected",
      skill
    });
  } catch (err) {
    console.error("Error rejecting skill:", err);
    res.status(500).json({ message: "Server error rejecting skill" });
  }
}