import User from "../models/User.js";


export const isAdmin = async (req, res, next) => {
  try {
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        message: "Unauthorized - Please log in" 
      });
    }

   
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ 
        message: "User not found" 
      });
    }

    
    if (user.role !== "admin") {
      return res.status(403).json({ 
        message: "Forbidden - Admin access required" 
      });
    }

    
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ 
      message: "Server error checking admin status" 
    });
  }
};