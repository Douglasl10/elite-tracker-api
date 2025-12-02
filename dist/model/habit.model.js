"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HabitsSchema = new mongoose_1.Schema({
    name: String,
    completedDates: [Date],
    userId: String,
}, {
    versionKey: false,
    timestamps: true,
});
const habitsModel = (0, mongoose_1.model)("habits", HabitsSchema);
exports.default = habitsModel;
