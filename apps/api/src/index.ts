/**
 * This is the entry point of the application
 * @author Vamsi Konakanchi <contact@vamsi-k.com>
 * @version 1.0
 */

import express from "express";
import cors from "cors";
import config from "./config";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mountRoutes from "./mount-routes";
import { handleCron } from "./handle-cron";
import logger from "./common/logger";
import { connect } from "mongoose";
import CONFIG from "./config";

logger.info("🚀 Application Starting...");

const corsConfig = {
  credentials: true,
  origin: config.ORIGINS.split(","),
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
};

const app = express();

app.use(morgan(CONFIG.PRODUCTION ? "combined" : "dev", {
  stream: { write: (msg) => logger.info(msg.trim()) }
}));
app.use(cors(corsConfig));
app.use(express.json());

app.use(cookieParser());
app.set("trust proxy", config.PRODUCTION);

app.use("/static", express.static("public"));

app.disable("x-powered-by"); // 📝 Disable x-powered-by header for security

const initializeServer = async () => {
  try {
    // 📦 Database Initialization
    await connect(config.DB_URL)
    logger.info("Database Connected Successfully");

    // 🌐 Server Initialization
    logger.info(`Starting the server on port ${config.PORT}...`);

    app.listen(config.PORT, () => {
      logger.info(`Server is listening on port: ${config.PORT} 🚀`);
    });
  } catch (error) {
    // logger.info("🚨 Error in server initialization", error);
    logger.info(
      `Error in server initialization \n`,
      JSON.stringify(error).replace(/,|{|}|and/g, "\n")
    );
    process.exit(1);
  }
};

initializeServer();

mountRoutes(app);

handleCron();
