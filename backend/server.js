require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const weeklyLogRoutes = require("./routes/weeklyLogRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskTypeRoutes = require("./routes/taskTypeRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:8000", // Frontend URL
        credentials: true, // allow cookies if needed
    })
);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB error:", err));

// Register Models
require("./models/timeSheetUsers");
require("./models/Project");
require("./models/TaskType");
require("./models/WeeklyLog");

// Routes
app.get("/", (req, res) => {
    res.send("✅ API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); // Optional: remove if duplicate
app.use("/api/projects", projectRoutes);
app.use("/api/tasktypes", taskTypeRoutes);
app.use("/api/weeklylogs", weeklyLogRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
