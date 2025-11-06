import mongoose from "mongoose";
import crypto from "crypto"; 

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6
  },
  salt: {
    type: String,
  },
  role: {
    type: String,
    enum: ["learner", "teacher", "admin"],
    default: "learner"
  },
  credits: {
    type: Number,
    default: 1,
    min: 0
  },
  skills: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.pre('save', function(next) {
  if (this.isModified('password') || this.isNew) {
    this.salt = this.makeSalt();
    this.password = this.encryptPassword(this.password); 
  }
  next();
});

UserSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.password;
  },

  encryptPassword: function(password) {
    if (!password || !this.salt) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt) 
        .update(password) 
        .digest("hex");
    } catch (err) {
      console.error("Error hashing password:", err);
      return "";
    }
  },

  makeSalt: function() {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  }
};
export default mongoose.model("User", UserSchema);
