const mongoose = require("mongoose");

const weekSchema = new mongoose.Schema({
    weekNumber: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
});

module.exports = mongoose.model("Week", weekSchema);
