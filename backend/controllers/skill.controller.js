import Skill from "../models/Skill";
import User from "../models/User";

export const getAllSkills = async (req, res) => {
    try {
        const {keyword, category} = req.query; //for search (optional)

        let query = {};

        if(keyword) {
            query.title = { $regex: keyword, $options: "i"}; //case sensitive
        }

        if(category) {
            query.category = category;
        }
        //Search by keyword and category if entered
        const skills = await Skill.find(query).populate("userId", "firstName lastName email"); //Replaces ObjectId with actual document
        res.status(200).json(skills);
    }
    catch(err) {
        console.error("Error fetching skills", err);
        res.status(500).json({ message: "Server error fetching skills"});
    }
}

export const getSkillById = async (req, res) => {
    try {
        const skill = await Skill.findById(req.params.id).populate("UserId", "firstName, lastName, email");
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
        const { title, descritpion, category, level} = req.body;
        const userId = req.user?.id;

        if (!userId)
            return res.status(401).json({message: "Unauthorized - user not logged in"});

        const skill = new Skill({
            title,
            description,
            category,
            level,
            userId
        })

        const savedSkill = await skill.save();

        await User.findByIdAndUpdate(userId, { $push: {skills: savedSkill._id} });

        res.status(201).json({
            message: "Skill created successfully",
            skill: savedSkill,
        })
    }
    catch (err) {
        console.error("Error creating skill: ", err);
        res.status(500).json({ message: "Server error creating skill" });
    }
}