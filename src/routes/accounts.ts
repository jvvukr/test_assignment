import { Router } from "express";
import { validate } from "../middlewares/validate.ts";
import { accountPayloadSchema } from "../models/account.ts";
import { createAccount, updateAccount, getStats } from "../controllers/accounts.ts";

const router = Router();

router.post("/", validate(accountPayloadSchema), createAccount);
router.put("/:id", validate(accountPayloadSchema), updateAccount);
router.get("/stats", getStats);

export default router;
