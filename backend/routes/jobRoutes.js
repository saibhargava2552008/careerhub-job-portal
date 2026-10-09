const express = require("express");
const mongoose = require("mongoose");
const Job = require("../models/Job");
const Application = require("../models/Application");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

const editableFields = ["title", "description", "company", "location", "salary", "skills", "jobType"];

// Create a job: recruiters only.
router.post("/", authMiddleware, roleMiddleware("recruiter"), async function (req, res) {
    try {
        const { title, description, company, location, salary, skills, jobType } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof description !== "string" || !description.trim() ||
            typeof company !== "string" || !company.trim() ||
            typeof location !== "string" || !location.trim() ||
            typeof salary !== "string" || !salary.trim() ||
            (skills !== undefined && (!Array.isArray(skills) || !skills.every(item => typeof item === "string"))) ||
            (jobType !== undefined && !["Full Time", "Part Time", "Internship", "Contract"].includes(jobType))
        ) {
            return res.status(400).json({ message: "Please provide valid job details" });
        }

        const job = await Job.create({
            title: title.trim(),
            description: description.trim(),
            company: company.trim(),
            location: location.trim(),
            salary: salary.trim(),
            skills: skills || [],
            jobType: jobType || "Full Time",
            recruiter: req.user.userId
        });

        return res.status(201).json({ message: "Job created successfully", job });
    } catch (error) {
        console.error("Failed to create job:", error.message);
        return res.status(500).json({ message: "Failed to create job" });
    }
});

// Get all jobs.
router.get("/", async function (req, res) {
    try {
        const jobs = await Job.find()
            .populate("recruiter", "name email")
            .sort({ createdAt: -1 });
        return res.status(200).json({ jobs });
    } catch (error) {
        console.error("Failed to fetch jobs:", error.message);
        return res.status(500).json({ message: "Failed to fetch jobs" });
    }
});

// Get one job.
router.get("/:id", async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid job ID" });
        }

        const job = await Job.findById(req.params.id).populate("recruiter", "name email");
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        return res.status(200).json({ job });
    } catch (error) {
        console.error("Failed to fetch job:", error.message);
        return res.status(500).json({ message: "Failed to fetch job" });
    }
});

// Update only allowed fields on the recruiter's own job.
router.put("/:id", authMiddleware, roleMiddleware("recruiter"), async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid job ID" });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.recruiter.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not allowed to update this job" });
        }

        const updates = {};
        for (const field of editableFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No valid job fields provided" });
        }

        if (updates.jobType !== undefined && !["Full Time", "Part Time", "Internship", "Contract"].includes(updates.jobType)) {
            return res.status(400).json({ message: "Invalid job type" });
        }
        if (updates.skills !== undefined && (!Array.isArray(updates.skills) || !updates.skills.every(item => typeof item === "string"))) {
            return res.status(400).json({ message: "Skills must be a list of text values" });
        }
        for (const field of ["title", "description", "company", "location", "salary"]) {
            if (updates[field] !== undefined && (typeof updates[field] !== "string" || !updates[field].trim())) {
                return res.status(400).json({ message: `Invalid ${field}` });
            }
            if (typeof updates[field] === "string") updates[field] = updates[field].trim();
        }

        Object.assign(job, updates);
        await job.save();

        return res.status(200).json({ message: "Job updated successfully", job });
    } catch (error) {
        console.error("Failed to update job:", error.message);
        return res.status(500).json({ message: "Failed to update job" });
    }
});

// Delete only the recruiter's own job and its related applications.
router.delete("/:id", authMiddleware, roleMiddleware("recruiter"), async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid job ID" });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.recruiter.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not allowed to delete this job" });
        }

        await Application.deleteMany({ job: job._id });
        await job.deleteOne();

        return res.status(200).json({ message: "Job deleted successfully" });
    } catch (error) {
        console.error("Failed to delete job:", error.message);
        return res.status(500).json({ message: "Failed to delete job" });
    }
});

module.exports = router;
