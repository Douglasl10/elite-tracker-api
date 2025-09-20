import { request, response, type Request, type Response } from "express";
import habitsModel from "../model/habit.model";
import z, { date } from "zod";
import { buildValidationErrorMessages } from "../utils/build-validation-error-message.utils";
import dayjs from "dayjs";
import mongoose from "mongoose";


export class HabitsController {


    store = async (request: Request, response: Response): Promise<Response> => {

        const schema = z.object({
            name: z.string(),
        });

        const habit = schema.safeParse(request.body);

        if (!habit.success) {
            const errors = buildValidationErrorMessages(habit.error.issues);
            return response.status(422).json({ message: errors });
        }

        const findHabit = await habitsModel.findOne({
            name: habit.data.name,
        });

        if (findHabit) {
            return response.status(400).json({ message: "Habit already exists" });

        }

        const newHabits = await habitsModel.create({
            name: habit.data.name,
            completedDates: [],
            userId: request.user.id,
        });

        return response.status(201).json(newHabits);
    }

    index = async (request: Request, response: Response) => {
        const habits = await habitsModel.find({
            userId: request.user.id,
        }).sort({ name: 1 });

        return response.status(200).json(habits);
    }

    remove = async (request: Request, response: Response) => {
        const schema = z.object({
            id: z.string(),
        });

        const habit = schema.safeParse(request.params);

        if (!habit.success) {
            const errors = buildValidationErrorMessages(habit.error.issues);
            return response.status(422).json({ message: errors });
        }

        const findHabit = await habitsModel.findOne({
            _id: habit.data.id,
            userId: request.user.id,
        });
        

        if (!findHabit) {
            return response.status(404).json({ message: "Habit not found" });
        }

        await habitsModel.deleteOne({
            _id: habit.data.id,
        });
        return response.status(200).json({ message: "Habit deleted successfully" });
    }

    toggle = async (request: Request, response: Response) => {
        const schema = z.object({
            id: z.string(),
        });

        const validated = schema.safeParse(request.params);

        if (!validated.success) {
            const errors = buildValidationErrorMessages(validated.error.issues);
            return response.status(422).json({ message: errors });
        }

        const findHabit = await habitsModel.findOne({
            _id: validated.data.id,
            userId: request.user.id,
        });

        if (!findHabit) {
            return response.status(404).json({ message: "Habit not found" });
        }

        const now = dayjs().startOf('day');

        const isHabitCompleted = findHabit.toObject()?.completedDates.find((item) => dayjs(String(item)).isSame(now));

        if (isHabitCompleted) {
            const habitUpdate = await habitsModel.findOneAndUpdate(
                { _id: validated.data.id },
                { $pull: { completedDates: now } },
                { returnDocument: 'after' }
            );

            return response.status(200).json({ message: "Habit already completed", habitUpdate });
        }

        const habitUpdate = await habitsModel.findOneAndUpdate(
            { _id: validated.data.id },
            { $push: { completedDates: now } },
            { returnDocument: 'after' }
        );
        return response.status(200).json({ message: "Habit completed successfully", habitUpdate });
    }

    metrics = async (request: Request, response: Response) => {
        const schema = z.object({
            id: z.string(),
            date: z.coerce.date()
        });

        const validated = schema.safeParse({ ...request.query, ...request.params });

        if (!validated.success) {
            const errors = buildValidationErrorMessages(validated.error.issues);
            return response.status(422).json({ message: errors });
        }

        const dateFrom = dayjs(validated.data.date).startOf('month');
        const dateTo = dayjs(validated.data.date).endOf('month');

        const [habitMatrics] = await habitsModel.aggregate().match({
            _id: new mongoose.Types.ObjectId(validated.data.id),
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
        })

        if (!habitMatrics) {
            return response.status(404).json({ message: "Habit not found" });
        }

        return response.status(200).json(habitMatrics);
    }
}
