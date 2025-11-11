import express from "express";
import type { Request, Response, NextFunction } from "express";
import z from "zod";

export const validate =
    (schema: z.ZodSchema<any>) =>
        (req: Request, res: Response, next: NextFunction) => {
            const parsed = schema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ errors: parsed.error });
            }
            (req as any).validated = parsed.data;
            next();
        };
