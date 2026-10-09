const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["jobseeker", "recruiter"],
            default: "jobseeker"
        },

        skills: {
            type: [String],
            default: []
        },

        profile: {
            phone: String,
            location: String,
            bio: String,
            resume: String
        }
    },

    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;