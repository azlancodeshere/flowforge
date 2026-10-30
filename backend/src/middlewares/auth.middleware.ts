
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import User from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import {z} from "zod"

export const authMiddleware = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
  try {

    const token: string | undefined =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");


    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }


    const secret = process.env.ACCESS_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "Access token secret is missing");
    }


    const decodedToken = jwt.verify(token, secret);


    if (
      typeof decodedToken === "string" ||
      typeof decodedToken._id !== "string" ||
      !Types.ObjectId.isValid(decodedToken._id)
    ) {
      throw new ApiError(401, "Invalid access token");
    }


    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }


    req.user = user;


    next();


  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
      });
      return;
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      res.status(401).json({
        statusCode: 401,
        message: "Invalid or expired access token",
        success: false,
      });
      return;
    }

    next(error);
  }
};


export const validateRequest = (schema: z.ZodType) => { return (req: Request,res: Response,next: NextFunction): void => {
    const result = schema.safeParse(req.body); // safeparse check data , if data valid then 400 response

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };
};


