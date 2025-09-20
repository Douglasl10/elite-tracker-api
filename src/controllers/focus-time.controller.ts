import { request, type Request, response, type Response } from "express";
import z from "zod";
import { buildValidationErrorMessages } from "../utils/build-validation-error-message.utils";
import dayjs from "dayjs";
import focusTimeModel from "../model/focus-time.model";


export class FocusTimeController {

    store = async (request: Request, response: Response): Promise<Response> => {

        const schema = z.object({
            timeFrom: z.coerce.date(),
            timeTo: z.coerce.date(),
        });

        const focusTime = schema.safeParse(request.body);

        if (!focusTime.success) {
            const errors = buildValidationErrorMessages(focusTime.error.issues);
            return response.status(422).json({ message: errors });
        }

        const timeFrom = dayjs(focusTime.data.timeFrom)
        const timeTo = dayjs(focusTime.data.timeTo)

        const isTimeToBeforeTimeFrom = timeTo.isBefore(timeFrom);

        if(isTimeToBeforeTimeFrom){
            return response.status(400).json({ message: "timeTo cannot be after timeFrom" });
        }

        const createdFocusTime = await focusTimeModel.create({
            timeFrom: timeFrom.toDate(),
            timeTo: timeTo.toDate(),
            userId: request.user.id
        });

        return response.status(200).json({ createdFocusTime });

    }

    index = async (request: Request, response: Response) => {
        const schema = z.object({
            date: z.coerce.date(),
        });

        const validated = schema.safeParse(request.query);

        if (!validated.success) {
            const errors = buildValidationErrorMessages(validated.error.issues);
            return response.status(422).json({ message: errors });
        }

        const startDate = dayjs(validated.data.date).startOf('day');
        const endDate = dayjs(validated.data.date).endOf('day');

        const focusTime = await focusTimeModel.find({
            timeFrom: {
                $gte: startDate.toDate(),
                $lte: endDate.toDate(),
            },
            userId: request.user.id
        }).sort({
            timeFrom: 1,
        })

        return response.status(200).json(focusTime);
    }

    metricsByMonth = async (request: Request, response: Response) => {

        const schema = z.object({
            date: z.coerce.date(),
        });

        const validated = schema.safeParse(request.query);

        if (!validated.success) {
            const errors = buildValidationErrorMessages(validated.error.issues);
            return response.status(422).json({ message: errors });
        }

        const startDate = dayjs(validated.data.date).startOf('month');
        const endDate = dayjs(validated.data.date).endOf('month');

        const focusTimeMetrics = await focusTimeModel.aggregate().match({
            timeFrom: {
                $gte: startDate.toDate(),
                $lte: endDate.toDate(),
            },
            userId: request.user.id
        }).project({
            year:  {
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
        })

        return response.status(200).json( focusTimeMetrics );
    }
}
