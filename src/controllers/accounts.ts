import type { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../db/mongo.ts";
import { accountSchema, type Account } from "../models/account.ts";
import { ZodError } from "zod";

const COLLECTION = "Accounts";

// ---------------- CREATE ----------------
export const createAccount = async (req: Request, res: Response): Promise<Response> => {
    try {
        const col_ = await getCollection<Account>(COLLECTION);
        const data = (req as any).validated;

        if ("createdAt" in req.body || "updatedAt" in req.body) {
            return res.status(400).json({
                errors: [{
                    path: ["timestamps"],
                    message: "createdAt/updatedAt are not allowed on create"
                }],
            });
        }

        const now = new Date();
        const newDoc = { ...data, createdAt: now, updatedAt: now };
        const result = await col_.insertOne(newDoc as any);
        const inserted = await col_.findOne({ _id: result.insertedId });

        if (!inserted) {
            return res.status(500).json({ error: "Failed to retrieve created account" });
        }

        return res.status(201).json(accountSchema.parse(inserted));
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ error: (err as Error).message });
    }
};

// ---------------- UPDATE ----------------
export const updateAccount = async (req: Request, res: Response): Promise<Response> => {
    try {
        const col_ = await getCollection<Account>(COLLECTION);
        const { id } = req.params;
        const data = (req as any).validated;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid account ID format" });
        }

        if ("createdAt" in req.body) {
            return res.status(400).json({
                errors: [{
                    path: ["createdAt"],
                    message: "createdAt is not allowed on update"
                }],
            });
        }

        const updatedAt = new Date();
        const result = await col_.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: { ...data, updatedAt } },
            { returnDocument: "after" }
        );

        if (!result) {
            return res.status(404).json({ error: "Account not found" });
        }

        return res.json(accountSchema.parse(result));
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(400).json({ errors: err.errors });
        }
        return res.status(500).json({ error: (err as Error).message });
    }
};

// ---------------- STATS ----------------
export const getStats = async (req: Request, res: Response): Promise<Response> => {
    try {
        const col_ = await getCollection<Account>(COLLECTION);
        const pipeline = [
            {
                $group: {
                    _id: "$scope",
                    count: { $sum: 1 }
                }
            }
        ];
        const results = await col_.aggregate(pipeline).toArray();

        const stats = {
            accounts: 0,
            prospects: 0,
            children: 0,
        };

        for (const r of results) {
            if (r._id === "account") stats.accounts = r.count;
            else if (r._id === "prospect") stats.prospects = r.count;
            else if (r._id === "child") stats.children = r.count;
        }

        return res.json(stats);
    } catch (err) {
        return res.status(500).json({ error: (err as Error).message });
    }
};
