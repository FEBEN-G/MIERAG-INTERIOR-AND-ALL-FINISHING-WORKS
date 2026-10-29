import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "./config/prisma";
import { logger } from "./utils/logger";

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
  logger.info(`Swagger UI at http://localhost:${env.PORT}/api/docs`);
});

async function shutdown(signal: string) {
  logger.info("Shutting down", { signal });
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});
process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
