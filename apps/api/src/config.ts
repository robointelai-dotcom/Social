/**
 * @fileoverview This file contains the configuration for the application.
 * @package SocioManager
 */

/**
 * Configuration for the application
 */

import { configDotenv } from "dotenv";

configDotenv();

const CONFIG = {
  // APP SETTINGS
  APP_NAME: "SocioManager",
  HOST: process.env.HOST || "http://localhost:5000",
  APP_URL: process.env.APP_URL || "http://localhost:5173",
  PORT: process.env.PORT || 5000,
  PRODUCTION: process.env.NODE_ENV === "production",
  ORIGINS:
    process.env.ORIGINS ||
    "http://localhost:5173,http://localhost:4173,https://quagga-strong-solely.ngrok-free.app",

  LOG_LEVEL: process.env.LOG_LEVEL || "info",

  // DATABASE SETTINGS
  DB_URL: process.env.DB_URL || "mongodb://127.0.0.1:27017/geelark",
  DB_POOL_SIZE: 10,
  DB_IDLE_TIMEOUT: 30000,
  DB_CONNECTION_TIMEOUT: 10000, // 10 seconds


  // GEELARK
  GEELARK_BASE_URL: process.env.GEELARK_BASE_URL || "",
  GEELARK_TOKEN: process.env.GEELARK_TOKEN || "dasdbasds",
  DEFAULT_TZ: process.env.DEFAULT_TZ || "Asia/Kolkata",

  // SMTP
  SMTP_FROM: process.env.SMTP_FROM || "",
  SMTP_URL: process.env.SMTP_URL || "",

  // FILE UPLOADS
  S3_REGION: process.env.S3_REGION || "",
  S3_ACCESS_ID: process.env.S3_ACCESS_ID || "",
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || "",
  S3_ENDPOINT: process.env.S3_ENDPOINT || "",
  MAX_FILE_SIZE: Number(process.env.MAX_FILE_SIZE || 1) * 1024 * 1024,

  // SECRETS
  JWT_ACCESSS_SECRET: process.env.JWT_ACCESSS_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "",

} as const;

export default CONFIG;
