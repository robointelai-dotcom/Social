import jwt from "jsonwebtoken";
import ms from "ms";
import { AuthUser } from "@shared/types";
import Config from "@/config";
import { Response } from "express";

/**
 * @description - generate access token
 * @param payload - token info
 * @returns - access token
 */
export const generateAccessToken = (payload: AuthUser): string => {
  return jwt.sign(payload, Config.JWT_ACCESSS_SECRET, {
    algorithm: "HS256",
    expiresIn: Config.JWT_ACCESS_EXPIRES_IN as ms.StringValue,
  });
};

/**
 * @description - generate refresh token
 * @param payload - token info
 * @returns - refresh token
 */
export const generateRefreshToken = (payload: AuthUser): string => {
  return jwt.sign(payload, Config.JWT_REFRESH_SECRET, {
    algorithm: "HS256",
    expiresIn: Config.JWT_REFRESH_EXPIRES_IN as ms.StringValue,
  });
};

/**
 * @description - generate onboard token
 * @param payload - token info
 * @returns - onboard token
 */
export const generatePassswordToken = (payload: AuthUser): string => {
  return jwt.sign(payload, Config.JWT_ACCESSS_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h",
  });
};

/**
 * @description - verify access token
 * @param token - access token
 * @returns - token info
 */
export const verifyAccessToken = (token: string): AuthUser => {
  return jwt.verify(token, Config.JWT_ACCESSS_SECRET) as AuthUser;
};

/**
 * @description - verify refresh token
 * @param token - refresh token
 * @returns - token info
 */
export const verifyRefreshToken = (token: string): AuthUser => {
  return jwt.verify(token, Config.JWT_REFRESH_SECRET) as AuthUser;
};


/**
 * @description - verify access token
 * @param token - access token
 * @returns - token info
 */
export const verifyPasswordToken = (token: string): AuthUser => {
  return jwt.verify(token, Config.JWT_ACCESSS_SECRET) as AuthUser;
};

/**
 *
 */
export const cookieSetter = (res: Response, key: string, value: string) => {
  res.cookie(key, value, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });
};
