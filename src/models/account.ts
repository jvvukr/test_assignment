import { z } from "zod";
import { ObjectId } from "mongodb";

export const baseModelSchema = z.object({
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const scopeEnum = z.enum(["account", "prospect", "child"]);

export const accountPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scope: scopeEnum,
});

export const accountSchema = accountPayloadSchema
    .extend({
      _id: z.instanceof(ObjectId).optional(),
    })
    .merge(baseModelSchema);

export type Account = z.infer<typeof accountSchema>;
export type AccountPayload = z.infer<typeof accountPayloadSchema>;
