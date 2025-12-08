import { Schema, model } from "mongoose";

const HabitsSchema = new Schema(
  {
    name: { type: String, required: true },
    completedDates: {
      type: [Date],
      default: [],
    },
    userId: { type: String, required: true },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

const habitsModel = model("habits", HabitsSchema);

export default habitsModel;
