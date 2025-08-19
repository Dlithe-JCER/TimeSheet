const mongoose = require("mongoose");
const Week = require("../models/Week");

// function from your code
async function generateWeeksForYear(year) {
    const start = new Date(year, 0, 1);
    let week = 1;
    let d = new Date(start);

    while (d.getFullYear() === year) {
        const startDate = new Date(d);
        const endDate = new Date(d);
        endDate.setDate(endDate.getDate() + 6);

        await Week.updateOne(
            { weekNumber: week },
            { $setOnInsert: { weekNumber: week, startDate, endDate } },
            { upsert: true }
        );

        d.setDate(d.getDate() + 7);
        week++;
    }
}

// connect DB and run
async function run() {
    try {
        await mongoose.connect("mongodb+srv://admin:admin123@cluster0.utu9p26.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); // change DB name if needed
        console.log("✅ MongoDB connected");

        await generateWeeksForYear(2025); // generate for current year
        console.log("✅ Weeks generated successfully");

        mongoose.disconnect();
    } catch (err) {
        console.error("❌ Error:", err);
    }
}

run();
