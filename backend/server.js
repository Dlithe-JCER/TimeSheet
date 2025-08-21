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
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB error:", err));

// Register Models
require("./models/timeSheetUsers");
require("./models/Project");
require("./models/TaskType");
require("./models/WeeklyLog");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); // Assuming you want to use the same auth routes for user management
app.use("/api/projects", projectRoutes);
app.use("/api/tasktypes", taskTypeRoutes);
app.use("/api/weeklylogs", weeklyLogRoutes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));