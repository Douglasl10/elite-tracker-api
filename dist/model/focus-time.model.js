"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FocusTimeSchema = new mongoose_1.Schema({
    timeFrom: Date,
    timeTo: Date,
    userId: String,
}, {
    versionKey: false,
    timestamps: true,
});
const focusTimeModel = (0, mongoose_1.model)("focusTime", FocusTimeSchema);
exports.default = focusTimeModel;
