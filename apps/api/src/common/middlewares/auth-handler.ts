import { NextFunction, Request, Response } from "express";
import {
  cookieSetter,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/common/auth.serivce";
import { AuthUser, IAuthRole, IUser } from "@shared/types";

/**
 * @description Middleware to check if the user is authenticated or not by checking the token from the cookie
 * and setting the user in the req object for further use and checking if the user is active or not
 */
export const memberAuthHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { accessToken, refreshToken } = req.cookies as {
    accessToken: string;
    refreshToken: string;
  };

  if (!accessToken || !refreshToken) {
    return res.status(401).json({
      msg: "Unauthorized: please login",
    });
  }

  try {
    // let decoded: AuthUser | null = null; 
    let decoded: any = null; // TODO : Check this
    let needToGenerateRefreshToken = false;
    let needToGenerateAccessToken = false;

    try {
      decoded = verifyAccessToken(accessToken);
    } catch (error) {
      needToGenerateAccessToken = true;
    }

    if (!decoded) {
      try {
        decoded = verifyRefreshToken(refreshToken);
        needToGenerateRefreshToken = true;
      } catch (error) { }
    }

    if (!decoded) {
      res.clearCookie("accessToken").clearCookie("refreshToken");
      return res.status(401).json({
        msg: `Token expired , please relogin`,
      });
    }

    const user: any = {}; // TODO : Correc this

    if (!user) {
      res.clearCookie("accessToken").clearCookie("refreshToken");
      return res.status(401).json({
        msg: "Unauthorized: User not found",
      });
    }

    const tokenPayload: any = {
      id: user.id,
      email: user.email,
      org_id: user.org_id,
      role: user.role,
      org_name: user.org_name,
      user_type: user.user_type,
    };

    if (needToGenerateAccessToken) {
      // setting new access token if is is expired
      cookieSetter(res, "accessToken", generateAccessToken(tokenPayload));
    }

    if (needToGenerateRefreshToken) {
      // setting new refresh token if it is expired
      cookieSetter(res, "refreshToken", generateRefreshToken(tokenPayload));
    }

    req.user = tokenPayload;

    next();
  } catch (error: any) {
    return res.status(500).json({
      msg: error.message || "Something went wrong",
    });
  }
};

/**
 * @description Middleware to check the allowed roles
 */
export const checkRoles = (rolesAllowed: IAuthRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user;

    if (!role) {
      return res.status(401).json({
        msg: "Unauthorized: Role is required",
      });
    }

    const isAllowed = rolesAllowed.includes(role);

    if (!isAllowed) {
      return res.status(403).json({
        msg: "You are not authorized to access this resource",
      });
    }

    next();
  };
};
