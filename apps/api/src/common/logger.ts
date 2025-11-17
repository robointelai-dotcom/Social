import CONFIG from "@/config";
import winston from "winston";

const logger = winston.createLogger({
    level: CONFIG.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message, label }) => {
            return `${timestamp} [${label || "App"}] ${level.toUpperCase()} - ${message}`;
        })
    ),
    transports: [new winston.transports.Console()]
});

export default logger;