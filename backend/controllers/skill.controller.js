import Skill from "../models/Skill.js";
import User from "../models/User.js";

export const getAllSkills = async (req, res) => {
    try {
        const {keyword, category} = req.query;

        let query = {};

        if(keyword) {
            query.title = { $regex: keyword, $options: "i"};
        }

        if(category) {
            query.category = category;
        }

        const skills = await Skill.find(query).populate("userId", "firstName lastName email");
        res.status(200).json(skills);
    }
    catch(err) {
        console.error("Error fetching skills", err);
        res.status(500).json({ message: "Server error fetching skills"});
    }
}

export const getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id).populate("userId", "firstName lastName email");
        if(!skill) return res.status(404).json({message: "Skill not found"});
        res.status(200).json(skill);
    }
    catch (err) {
        console.error("Error fetching skill by Id:", err);
        res.status(500).json({ message: "Server error fetching skill"});
    }
}

export const createSkill = async (req, res) => {
    try {
        const { title, description, category, level } = req.body;
        const userId = req.user?.id;

        if (!userId)
            return res.status(401).json({message: "Unauthorized - user not logged in"});

        const skill = new Skill({
            title,
            description,
            category,
            level,
            userId
        });

        const savedSkill = await skill.save();

        await User.findByIdAndUpdate(userId, { $push: {skills: savedSkill._id} });

        res.status(201).json({
            message: "Skill created successfully",
            skill: savedSkill,
        });
    }
    catch (err) {
        console.error("Error creating skill: ", err);
        res.status(500).json({ message: "Server error creating skill" });
    }
};

export const deleteSkill = async (req, res) => {
    try {
        const skillId = req.params.id;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized - user not logged in" });
        }

        const skill = await Skill.findById(skillId);
        if (!skill) {
            return res.status(404).json({ message: "Skill not found" });
        }

        if (skill.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own skills" });
        }

        await Skill.findByIdAndDelete(skillId);

        await User.findByIdAndUpdate(userId, { $pull: { skills: skillId } });

        res.status(200).json({ message: "Skill deleted successfully" });
    } catch (err) {
        console.error("Error deleting skill:", err);
        res.status(500).json({ message: "Server error deleting skill" });
    }
};

export const requestSkill = async (req, res) => {
  try {
    const skillId = req.params.skillId;
    const studentId = req.user.id;

    const skill = await Skill.findById(skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });

    if (!skill.pendingRequests) skill.pendingRequests = [];

    if (skill.pendingRequests.find(r => r.student.toString() === studentId)) {
      return res.status(400).json({ message: "You already requested this skill" });
    }

    skill.pendingRequests.push({ student: studentId });
    await skill.save();

    res.status(200).json({ message: "Request sent to instructor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to request skill" });
  }
};

export const getSkillRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const mySkills = await Skill.find({ userId }).select('_id title');

    if (!mySkills.length) {
      return res.status(200).json([]);
    }

    const mySkillIds = mySkills.map(skill => skill._id);

    const requests = await SkillRequest.find({ skillId: { $in: mySkillIds } })
      .populate('skillId', 'title')
      .populate('studentId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const formattedRequests = requests.map(req => ({
      requestId: req._id,
      skillId: req.skillId._id,
      skillTitle: req.skillId.title,
      studentId: req.studentId._id,
      studentName: `${req.studentId.firstName} ${req.studentId.lastName}`,
      studentEmail: req.studentId.email,
      requestedAt: req.createdAt,
      status: req.status || 'pending'
    }));

    res.status(200).json(formattedRequests);
  } catch (error) {
    console.error('Error fetching skill requests:', error);
    res.status(500).json({ message: 'Failed to fetch skill requests' });
  }
};
