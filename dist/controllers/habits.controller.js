"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitsController = void 0;
const habit_model_1 = __importDefault(require("../model/habit.model"));
const zod_1 = __importDefault(require("zod"));
const build_validation_error_message_utils_1 = require("../utils/build-validation-error-message.utils");
const dayjs_1 = __importDefault(require("dayjs"));
const mongoose_1 = __importDefault(require("mongoose"));
class HabitsController {
    constructor() {
        this.store = async (request, response) => {
            const schema = zod_1.default.object({
                name: zod_1.default.string(),
            });
            const habit = schema.safeParse(request.body);
            if (!habit.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(habit.error.issues);
                return response.status(422).json({ message: errors });
            }
            const findHabit = await habit_model_1.default.findOne({
                name: habit.data.name,
            });
            if (findHabit) {
                return response.status(400).json({ message: "Habit already exists" });
            }
            const newHabits = await habit_model_1.default.create({
                name: habit.data.name,
                completedDates: [],
                userId: request.user.id,
            });
            return response.status(201).json(newHabits);
        };
        this.index = async (request, response) => {
            const habits = await habit_model_1.default.find({
                userId: request.user.id,
            }).sort({ name: 1 });
            return response.status(200).json(habits);
        };
        this.remove = async (request, response) => {
            const schema = zod_1.default.object({
                id: zod_1.default.string(),
            });
            const habit = schema.safeParse(request.params);
            if (!habit.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(habit.error.issues);
                return response.status(422).json({ message: errors });
            }
            const findHabit = await habit_model_1.default.findOne({
                _id: habit.data.id,
                userId: request.user.id,
            });
            if (!findHabit) {
                return response.status(404).json({ message: "Habit not found" });
            }
            await habit_model_1.default.deleteOne({
                _id: habit.data.id,
            });
            return response.status(200).json({ message: "Habit deleted successfully" });
        };
        this.toggle = async (request, response) => {
            const schema = zod_1.default.object({
                id: zod_1.default.string(),
            });
            const validated = schema.safeParse(request.params);
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return response.status(422).json({ message: errors });
            }
            const findHabit = await habit_model_1.default.findOne({
                _id: validated.data.id,
                userId: request.user.id,
            });
            if (!findHabit) {
                return response.status(404).json({ message: "Habit not found" });
            }
            const now = (0, dayjs_1.default)().startOf('day');
            const isHabitCompleted = findHabit.toObject()?.completedDates.find((item) => (0, dayjs_1.default)(String(item)).isSame(now));
            if (isHabitCompleted) {
                const habitUpdate = await habit_model_1.default.findOneAndUpdate({ _id: validated.data.id }, { $pull: { completedDates: now } }, { returnDocument: 'after' });
                return response.status(200).json({ message: "Habit already completed", habitUpdate });
            }
            const habitUpdate = await habit_model_1.default.findOneAndUpdate({ _id: validated.data.id }, { $push: { completedDates: now } }, { returnDocument: 'after' });
            return response.status(200).json({ message: "Habit completed successfully", habitUpdate });
        };
        this.metrics = async (request, response) => {
            const schema = zod_1.default.object({
                id: zod_1.default.string(),
                date: zod_1.default.coerce.date()
            });
            const validated = schema.safeParse({ ...request.query, ...request.params });
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return response.status(422).json({ message: errors });
            }
            const dateFrom = (0, dayjs_1.default)(validated.data.date).startOf('month');
            const dateTo = (0, dayjs_1.default)(validated.data.date).endOf('month');
            const [habitMatrics] = await habit_model_1.default.aggregate().match({
                _id: new mongoose_1.default.Types.ObjectId(validated.data.id),
                userId: request.user.id
            }).project({
                _id: 1,
                name: 1,
                completedDates: {
                    $filter: {
                        input: "$completedDates",
                        as: "completedDate",
                        cond: {
                            $and: [
                                {
                                    $gte: ['$$completedDate', dateFrom.toDate()]
                                },
                                {
                                    $lte: ['$$completedDate', dateTo.toDate()]
                                }
                            ]
                        }
                    }
                },
            });
            if (!habitMatrics) {
                return response.status(404).json({ message: "Habit not found" });
            }
            return response.status(200).json(habitMatrics);
        };
    }
}
exports.HabitsController = HabitsController;
