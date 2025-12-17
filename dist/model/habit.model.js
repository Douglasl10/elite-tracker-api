"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const HabitsSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    completedDates: {
        type: [Date],
        default: [],
    },
    userId: { type: String, required: true },
}, {
    versionKey: false,
    timestamps: true,
});
const habitsModel = (0, mongoose_1.model)("habits", HabitsSchema);
exports.default = habitsModel;
