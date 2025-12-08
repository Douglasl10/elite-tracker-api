import { type Request, type Response } from "express";
import z from "zod";
import dayjs from "dayjs";
import focusTimeModel from "../model/focus-time.model";
import { buildValidationErrorMessages } from "../utils/build-validation-error-message.utils";

export class FocusTimeController {
  store = async (req: Request, res: Response): Promise<Response> => {
    const schema = z.object({
      timeFrom: z.coerce.date(),
      timeTo: z.coerce.date(),
    });

    const validated = schema.safeParse(req.body);

    if (!validated.success) {
      const errors = buildValidationErrorMessages(validated.error.issues);
      return res.status(422).json({ message: errors });
    }

    const timeFrom = dayjs(validated.data.timeFrom);
    const timeTo = dayjs(validated.data.timeTo);

    if (timeTo.isBefore(timeFrom)) {
      return res.status(400).json({
        message: "timeTo cannot be before timeFrom",
      });
    }

    // Garantir que o usuário existe no request (JWT Middleware)
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const createdFocusTime = await focusTimeModel.create({
      timeFrom: timeFrom.toDate(),
      timeTo: timeTo.toDate(),
      userId: req.user.id,
    });

    return res.status(201).json({ createdFocusTime });
  };

  index = async (req: Request, res: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(req.query);

    if (!validated.success) {
      const errors = buildValidationErrorMessages(validated.error.issues);
      return res.status(422).json({ message: errors });
    }

    const startDate = dayjs(validated.data.date).startOf("day");
    const endDate = dayjs(validated.data.date).endOf("day");

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const focusTime = await focusTimeModel
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

  metricsByMonth = async (req: Request, res: Response) => {
    const schema = z.object({
      date: z.coerce.date(),
    });

    const validated = schema.safeParse(req.query);

    if (!validated.success) {
      const errors = buildValidationErrorMessages(validated.error.issues);
      return res.status(422).json({ message: errors });
    }

    const startDate = dayjs(validated.data.date).startOf("month");
    const endDate = dayjs(validated.data.date).endOf("month");

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const metrics = await focusTimeModel
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
