import { Schema, model } from "mongoose";

const FocusTimeSchema = new Schema(
    {
        timeFrom: Date,
        timeTo: Date,
        userId: String,
    },
    {
        versionKey: false,
        timestamps: true,
    },
)

const focusTimeModel = model("focusTime", FocusTimeSchema)

export default focusTimeModel
