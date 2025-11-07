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

        const skills = await Skill.find(query).populate("userId", "firstName lastName email");
        res.status(200).json(skills);
    }
    catch(err) {
        console.error("Error fetching skills", err);
        res.status(500).json({ message: "Server error fetching skills"});
    }
}