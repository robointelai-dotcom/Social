import { Request, Response, NextFunction } from "express";
import { CacheOptions } from "@shared/types";

export const setCacheControl = (options: CacheOptions = {}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Default max age is 1 hour if not specified
    const maxAge = options.maxAge || 3600;

    if (options.noStore) {
      // No caching at all
      res.setHeader("Cache-Control", "no-store");
    } else if (options.private) {
      // Private caching (browser only)
      res.setHeader("Cache-Control", `private, max-age=${maxAge}`);
    } else {
      // Public caching (can be cached by browsers and intermediary caches)
      res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    }

    next();
  };
};
