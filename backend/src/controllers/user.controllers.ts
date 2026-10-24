import User from "../models/user.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import mongoose, { Types } from "mongoose"
import jwt from "jsonwebtoken"

import { Request, Response, CookieOptions } from "express";

export const generateAccessAndRefreshTokens = async (
    userId: Types.ObjectId
): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(
                404,
                "User not found"

            )
        }


        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };


    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            500,
            "Something went wrong while generating tokens"
        );
    }

};


export const refreshAccessToken = async ( req: Request,res: Response): Promise<void> => {
  try {
   
    const incomingRefreshToken: string | undefined =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

   
    const secret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
      throw new ApiError(500, "Refresh token secret is not configured");
    }

    const decodedToken = jwt.verify(incomingRefreshToken, secret);

    
    if (
      typeof decodedToken === "string" ||
      !("_id" in decodedToken) ||
      typeof decodedToken._id !== "string"
    ) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (!Types.ObjectId.isValid(decodedToken._id)) {
      throw new ApiError(401, "Invalid refresh token");
    }

    
    
    const user = await User.findById(decodedToken._id).select("+refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

   
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user._id);

   
    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };

    
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );

    return;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        statusCode: 401,
        message: "Invalid or expired refresh token",
        success: false,
      });
      return;
    }

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while refreshing token",
      success: false,
    });
  }
};


export const registerUser = async (req:Request, res:Response):Promise<void>=>{

  try {
    const {username,email,password} = req.body ?? {};

    if ([username, email, password].some((field)=> typeof field !== "string" || field.trim() === "")) {
      throw new ApiError(
        400,
        "All fields are required"
      )
      
    }

    // Normalize the way the schema does on save (email: lowercase+trim,
    // username: trim) — mongoose does NOT transform query values, so raw
    // input like " JOHN@X.COM " would miss the duplicate and slip through.
    const existingUser = await User.findOne({
      $or:[
        {username: username.trim()},
        {email: email.trim().toLowerCase()},
      ]
    })

    if (existingUser) {
      throw  new ApiError(
        409,
        "User with this email or username already exists"

      )
      
    }

  const user = await User.create({
    username,
    email,
    password
  })

  const createdUser = await User.findById(user._id)
                      .select("-password -refreshToken")

  if (!createdUser) {
            throw new ApiError(
                500,
                "Something went wrong while registering the user"
            );
        }

        const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };


  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)
     

  res
   .status(201)
   .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
          201,
          { user: createdUser, accessToken, refreshToken },
          "User registered successfully"
        )
      );


  } catch (error) {
    console.error("register error:", error);

    
    // Map duplicate-key races (unique index) to 409, schema validation
    // failures (short password, etc.) to 400, everything else to 500
    const apiError =
      error instanceof ApiError
        ? error
        : error instanceof mongoose.Error.ValidationError
          ? new ApiError(
              400,
              Object.values(error.errors)
                .map((e) => e.message)
                .join(", ") || "Invalid registration details"
            )
          : (error as { code?: number })?.code === 11000
            ? new ApiError(409, "User with this email or username already exists")
            : new ApiError(500, "Something went wrong while registering the user");

    res.status(apiError.statusCode).json({
      statusCode: apiError.statusCode,
      message: apiError.message,
      success: false,
    });
  }
}




export const loginUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password, username } = req.body ?? {};

    
    // Match the schema's save-time transforms (email: lowercase+trim,
    // username: trim) — mongoose does NOT normalize query values for us.
    const identifier =
      typeof email === "string" && email.trim() !== ""
        ? { email: email.trim().toLowerCase() }
        : typeof username === "string" && username.trim() !== ""
          ? { username: username.trim() }
          : null;

    if (!identifier || typeof password !== "string" || password === "") {
      throw new ApiError(
        400,
        "Email/username and password are required"
      );
    }

   
    // password is `select: false` — opting OUT here left user.password
    // undefined, so bcrypt.compare() could never succeed
    const user = await User.findOne(identifier).select("+password");

    if (!user) {
      throw new ApiError(401, "Invalid email/username or password");
    }

   
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email/username or password");
    }

   
    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user._id);

   
    const options: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    };


  
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
          },
          "User logged in successfully"
        )
      );

    return;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        statusCode: error.statusCode,
        message: error.message,
        success: false,
      });
      return;
    }

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while logging in",
      success: false,
    });
  }
};


export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  const options: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  try {
    // verifyJWT (route middleware) guarantees req.user — revoke the stored
    // refresh token even if the refresh cookie itself is missing or expired.
    await User.findByIdAndUpdate(req.user._id, {
      $unset: {
        refreshToken: null,
      },
    });

    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Logged out successfully"));
  } catch (error) {
    console.error("logout error:", error);

    res.status(500).json({
      statusCode: 500,
      message: "Something went wrong while logging out",
      success: false,
    });
  }
};


