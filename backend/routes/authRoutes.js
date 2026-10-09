const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.get("/test", function (req, res) {
    res.json({ message: "Auth route is working" });
});

// Register as a job seeker or recruiter. Admin accounts cannot be self-created.
router.post("/register", async function (req, res) {
    try {
        const { name, email, password, role } = req.body;

        if (
            typeof name !== "string" || !name.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length < 8 ||
            !["jobseeker", "recruiter"].includes(role)
        ) {
            return res.status(400).json({
                message: "Enter a name, valid email, password (at least 8 characters), and a valid role"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role
        });

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills,
            profile: user.profile,
            createdAt: user.createdAt
        };

        return res.status(201).json({
            message: "User registered successfully",
            user: safeUser
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "User already exists" });
        }
        console.error("Registration failed:", error.message);
        return res.status(500).json({ message: "Registration failed" });
    }
});

router.post("/login", async function (req, res) {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            skills: user.skills,
            profile: user.profile
        };

        return res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Login failed" });
    }
});

module.exports = router;
