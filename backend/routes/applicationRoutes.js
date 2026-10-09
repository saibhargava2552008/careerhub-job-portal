const express = require("express");
const mongoose = require("mongoose");
const Application = require("../models/Application");
const Job = require("../models/Job");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();
const validStatuses = ["Applied", "Shortlisted", "Rejected", "Selected"];

// Job seekers can apply once per job.
router.post("/", authMiddleware, roleMiddleware("jobseeker"), async function (req, res) {
    try {
        const { job, resume } = req.body;

        if (!mongoose.isValidObjectId(job)) {
            return res.status(400).json({ message: "A valid job ID is required" });
        }
        if (typeof resume !== "string" || !/^https?:\/\//i.test(resume.trim())) {
            return res.status(400).json({ message: "Resume must be a valid http or https link" });
        }

        const jobExists = await Job.findById(job);
        if (!jobExists) {
            return res.status(404).json({ message: "Job not found" });
        }

        const existingApplication = await Application.findOne({
            job,
            applicant: req.user.userId
        });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }

        const application = await Application.create({
            job,
            applicant: req.user.userId,
            resume: resume.trim()
        });

        return res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You have already applied for this job" });
        }
        console.error("Failed to submit application:", error.message);
        return res.status(500).json({ message: "Failed to submit application" });
    }
});

// A job seeker can view only their own applications.
router.get("/my", authMiddleware, roleMiddleware("jobseeker"), async function (req, res) {
    try {
        const applications = await Application.find({ applicant: req.user.userId })
            .populate("job")
            .sort({ createdAt: -1 });
        return res.status(200).json({ applications });
    } catch (error) {
        console.error("Failed to fetch applications:", error.message);
        return res.status(500).json({ message: "Failed to fetch applications" });
    }
});

// Only the recruiter who owns the job can see its applicants.
router.get("/job/:jobId", authMiddleware, roleMiddleware("recruiter"), async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.jobId)) {
            return res.status(400).json({ message: "Invalid job ID" });
        }

        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (job.recruiter.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not allowed to view applicants for this job" });
        }

        const applications = await Application.find({ job: job._id })
            .populate("applicant", "name email")
            .populate("job", "title company")
            .sort({ createdAt: -1 });

        return res.status(200).json({ applications });
    } catch (error) {
        console.error("Failed to fetch applicants:", error.message);
        return res.status(500).json({ message: "Failed to fetch applications" });
    }
});

// Only the owner-recruiter may change an application status.
router.put("/:id", authMiddleware, roleMiddleware("recruiter"), async function (req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid application ID" });
        }

        const { status } = req.body;
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid application status" });
        }

        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        const job = await Job.findById(application.job);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        if (job.recruiter.toString() !== req.user.userId) {
            return res.status(403).json({ message: "You are not allowed to update this application" });
        }

        application.status = status;
        await application.save();

        return res.status(200).json({ message: "Application status updated", application });
    } catch (error) {
        console.error("Failed to update application:", error.message);
        return res.status(500).json({ message: "Failed to update application" });
    }
});

module.exports = router;
