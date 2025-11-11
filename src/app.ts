import express from "express";
import accountsRouter from "./routes/accounts.ts";

const app = express();
app.use(express.json());

// routes
app.use("/accounts", accountsRouter);

export default app;
