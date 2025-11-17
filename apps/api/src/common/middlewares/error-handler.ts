import { NextFunction, Request, Response } from "express";
import logger from "@/common/logger";

/**
 * This is the error handler it will catch all the errors in the application
 * and sends it as a response along with appropriate error code
 */
const ErrorHandler = (
  err: any,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  let errCode = 500;

  // if (err.code && !err.routine && typeof err.code === "number") {
  //   errCode = err.code;
  // }

  logger.error(err);

  res.status(errCode).json({
    msg:
      err.message || "Something went wrong , please try again after some time",
  });

  next();
};

export default ErrorHandler;
