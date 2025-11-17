import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";

export const validate = (validationChain: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await Promise.all(
        validationChain.map((validation) => validation.run(req))
      );

      const errors = validationResult(req);

      if (errors.isEmpty()) {
        return next();
      }

      const msg = errors
        .array()
        .map((err) => err.msg)
        .join("\n");

      return res.status(400).json({ msg });
    } catch (error: any) {
      return res.status(500).json({ msg: error.message });
    }
  };
};
