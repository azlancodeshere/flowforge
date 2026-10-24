import User from "../models/user.model"
import { ApiError } from "../utils/ApiError"
import { ApiResponse } from "../utils/ApiResponse"
import { Types } from "mongoose"
import jwt from "jsonwebtoken"
import { Request, Response, CookieOptions } from "express"

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
}

const sendError = (res: Response, error: unknown, fallback: string): void => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500
  const message = error instanceof ApiError ? error.message : fallback
  res.status(statusCode).json({ statusCode, message, success: false })
}

export const generateAccessAndRefreshTokens = async (
  userId: Types.ObjectId
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, "User not found")

  const accessToken = user.generateAccessToken()
  const refreshToken = user.generateRefreshToken()

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  return { accessToken, refreshToken }
}

export const refreshAccessToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const incomingRefreshToken: string | undefined =
      req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingRefreshToken) throw new ApiError(401, "Refresh token is required")

    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as string)
    if (typeof decoded === "string" || typeof decoded._id !== "string" || !Types.ObjectId.isValid(decoded._id))
      throw new ApiError(401, "Invalid refresh token")

    const user = await User.findById(decoded._id).select("+refreshToken")
    if (!user || incomingRefreshToken !== user.refreshToken)
      throw new ApiError(401, "Refresh token is expired or invalid")

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "Access token refreshed successfully"))
  } catch (error) { sendError(res, error, "Something went wrong while refreshing token") }
}


export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body ?? {}

    if ([username, email, password].some((f) => typeof f !== "string" || !f.trim()))
      throw new ApiError(400, "All fields are required")

    const exists = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }],
    })
    if (exists) throw new ApiError(409, "User with this email or username already exists")

    const user = await User.create({ username, email, password })
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(201, { user: createdUser, accessToken }, "User registered successfully"))
  } catch (error) { sendError(res, error, "Something went wrong while registering") }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body ?? {}

    const identifier =
      typeof email === "string" && email.trim()
        ? { email: email.trim().toLowerCase() }
        : typeof username === "string" && username.trim()
          ? { username: username.trim() }
          : null

    if (!identifier || typeof password !== "string" || !password)
      throw new ApiError(400, "Email/username and password are required")

    const user = await User.findOne(identifier).select("+password")
    if (!user || !(await user.isPasswordCorrect(password)))
      throw new ApiError(401, "Invalid email/username or password")

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully"))
  } catch (error) { sendError(res, error, "Something went wrong while logging in") }
}

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: null } })

    res
      .status(200)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(new ApiResponse(200, {}, "Logged out successfully"))
  } catch (error) { sendError(res, error, "Something went wrong while logging out") }
}

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).
    json(new ApiResponse(200, 
      { user: req.user },
       "Current user fetched"))
  } catch (error) { sendError(res, error, "Something went wrong") }
}

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body ?? {}
    if (!username && !email) throw new ApiError(400, "At least one field is required")

    const updates: { username?: string; email?: string } = {}
    if (username) updates.username = username.trim()
    if (email) updates.email = email.trim().toLowerCase()

    const or: object[] = []
    if (updates.username) or.push({ username: updates.username })
    if (updates.email) or.push({ email: updates.email })

    const existing = await User.findOne({ _id: { $ne: req.user._id }, $or: or })
    if (existing) throw new ApiError(409, "Username or email already exists")

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken")
    if (!updatedUser) throw new ApiError(404, "User not found")

    res.status(200).json(new ApiResponse(200, { user: updatedUser }, "User updated successfully"))
  } catch (error) { sendError(res, error, "Something went wrong while updating the user") }
}

