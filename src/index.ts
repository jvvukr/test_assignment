import app from "./app.ts";
import { closeConnection } from "./db/mongo.ts";
import { logger } from './utils/logger.ts';

const PORT = process.env.PORT || 3000;

const startServer = async (): Promise<void> => {
    try {
        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
        });

        // Graceful shutdown
        const shutdown = async (signal: string): Promise<void> => {
            logger.info(`${signal} received. Closing server gracefully...`);
            server.close(async () => {
                await closeConnection();
                logger.info("Server closed");
                process.exit(0);
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    } catch (err) {
        logger.error("Failed to start server:", err);
        await closeConnection();
        process.exit(1);
    }
};

startServer();
