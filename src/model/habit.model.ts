import { Schema, model } from "mongoose";

const HabitsSchema = new Schema(
    {
       name: String,
       completedDates: [Date],
       userId: String,
    },
    {
        versionKey: false,
        timestamps: true,
    },
)

const habitsModel = model("habits", HabitsSchema)

export default habitsModel