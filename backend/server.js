require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const authMiddleware = require("./middleware/authMiddleware");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/api/protected", authMiddleware, function (req, res) {
    res.json({
        message: "You accessed a protected route!",
        user: req.user
    });
});

app.get("/", function (req, res) {
    res.send("CareerHub Backend Server is Running!");
});

connectDB();

app.listen(PORT, function () {
    console.log(`CareerHub server running on http://localhost:${PORT}`);
});
