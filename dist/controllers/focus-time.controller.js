"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusTimeController = void 0;
const zod_1 = __importDefault(require("zod"));
const dayjs_1 = __importDefault(require("dayjs"));
const focus_time_model_1 = __importDefault(require("../model/focus-time.model"));
const build_validation_error_message_utils_1 = require("../utils/build-validation-error-message.utils");
class FocusTimeController {
    constructor() {
        this.store = async (req, res) => {
            const schema = zod_1.default.object({
                timeFrom: zod_1.default.coerce.date(),
                timeTo: zod_1.default.coerce.date(),
            });
            const validated = schema.safeParse(req.body);
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return res.status(422).json({ message: errors });
            }
            const timeFrom = (0, dayjs_1.default)(validated.data.timeFrom);
            const timeTo = (0, dayjs_1.default)(validated.data.timeTo);
            if (timeTo.isBefore(timeFrom)) {
                return res.status(400).json({
                    message: "timeTo cannot be before timeFrom",
                });
            }
            // Garantir que o usuário existe no request (JWT Middleware)
            if (!req.user?.id) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const createdFocusTime = await focus_time_model_1.default.create({
                timeFrom: timeFrom.toDate(),
                timeTo: timeTo.toDate(),
                userId: req.user.id,
            });
            return res.status(201).json({ createdFocusTime });
        };
        this.index = async (req, res) => {
            const schema = zod_1.default.object({
                date: zod_1.default.coerce.date(),
            });
            const validated = schema.safeParse(req.query);
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return res.status(422).json({ message: errors });
            }
            const startDate = (0, dayjs_1.default)(validated.data.date).startOf("day");
            const endDate = (0, dayjs_1.default)(validated.data.date).endOf("day");
            if (!req.user?.id) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const focusTime = await focus_time_model_1.default
                .find({
                userId: req.user.id,
                timeFrom: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate(),
                },
            })
                .sort({ timeFrom: 1 });
            return res.status(200).json(focusTime);
        };
        this.metricsByMonth = async (req, res) => {
            const schema = zod_1.default.object({
                date: zod_1.default.coerce.date(),
            });
            const validated = schema.safeParse(req.query);
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return res.status(422).json({ message: errors });
            }
            const startDate = (0, dayjs_1.default)(validated.data.date).startOf("month");
            const endDate = (0, dayjs_1.default)(validated.data.date).endOf("month");
            if (!req.user?.id) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const metrics = await focus_time_model_1.default
                .aggregate()
                .match({
                userId: req.user.id,
                timeFrom: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate(),
                },
            })
                .project({
                year: { $year: "$timeFrom" },
                month: { $month: "$timeFrom" },
                day: { $dayOfMonth: "$timeFrom" },
            })
                .group({
                _id: { year: "$year", month: "$month", day: "$day" },
                total: { $sum: 1 },
            })
                .sort({ "_id.year": 1, "_id.month": 1, "_id.day": 1 });
            return res.status(200).json(metrics);
        };
    }
}
exports.FocusTimeController = FocusTimeController;
