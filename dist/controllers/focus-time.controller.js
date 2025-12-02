"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusTimeController = void 0;
const zod_1 = __importDefault(require("zod"));
const build_validation_error_message_utils_1 = require("../utils/build-validation-error-message.utils");
const dayjs_1 = __importDefault(require("dayjs"));
const focus_time_model_1 = __importDefault(require("../model/focus-time.model"));
class FocusTimeController {
    constructor() {
        this.store = async (request, response) => {
            const schema = zod_1.default.object({
                timeFrom: zod_1.default.coerce.date(),
                timeTo: zod_1.default.coerce.date(),
            });
            const focusTime = schema.safeParse(request.body);
            if (!focusTime.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(focusTime.error.issues);
                return response.status(422).json({ message: errors });
            }
            const timeFrom = (0, dayjs_1.default)(focusTime.data.timeFrom);
            const timeTo = (0, dayjs_1.default)(focusTime.data.timeTo);
            const isTimeToBeforeTimeFrom = timeTo.isBefore(timeFrom);
            if (isTimeToBeforeTimeFrom) {
                return response.status(400).json({ message: "timeTo cannot be after timeFrom" });
            }
            const createdFocusTime = await focus_time_model_1.default.create({
                timeFrom: timeFrom.toDate(),
                timeTo: timeTo.toDate(),
                userId: request.user.id
            });
            return response.status(200).json({ createdFocusTime });
        };
        this.index = async (request, response) => {
            const schema = zod_1.default.object({
                date: zod_1.default.coerce.date(),
            });
            const validated = schema.safeParse(request.query);
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return response.status(422).json({ message: errors });
            }
            const startDate = (0, dayjs_1.default)(validated.data.date).startOf('day');
            const endDate = (0, dayjs_1.default)(validated.data.date).endOf('day');
            const focusTime = await focus_time_model_1.default.find({
                timeFrom: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate(),
                },
                userId: request.user.id
            }).sort({
                timeFrom: 1,
            });
            return response.status(200).json(focusTime);
        };
        this.metricsByMonth = async (request, response) => {
            const schema = zod_1.default.object({
                date: zod_1.default.coerce.date(),
            });
            const validated = schema.safeParse(request.query);
            if (!validated.success) {
                const errors = (0, build_validation_error_message_utils_1.buildValidationErrorMessages)(validated.error.issues);
                return response.status(422).json({ message: errors });
            }
            const startDate = (0, dayjs_1.default)(validated.data.date).startOf('month');
            const endDate = (0, dayjs_1.default)(validated.data.date).endOf('month');
            const focusTimeMetrics = await focus_time_model_1.default.aggregate().match({
                timeFrom: {
                    $gte: startDate.toDate(),
                    $lte: endDate.toDate(),
                },
                userId: request.user.id
            }).project({
                year: {
                    $year: "$timeFrom",
                },
                month: {
                    $month: "$timeFrom",
                },
                day: {
                    $dayOfMonth: "$timeFrom",
                },
            }).group({
                _id: [
                    "$year",
                    "$month",
                    "$day",
                ],
                total: {
                    $sum: 1,
                },
            }).sort({
                _id: 1,
            });
            return response.status(200).json(focusTimeMetrics);
        };
    }
}
exports.FocusTimeController = FocusTimeController;
