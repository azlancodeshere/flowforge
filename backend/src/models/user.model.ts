import mongoose, { Schema, Document } from "mongoose"
import jwt, { SignOptions } from "jsonwebtoken"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  username: string
  email: string
  password: string
  refreshToken?: string
  googleId:string
  isPasswordCorrect(entered: string): Promise<boolean>
  generateAccessToken(): string
  generateRefreshToken(): string
}

export type User = IUser;

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, minlength: 2, maxlength: 50 },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },


    password: { type: String, required: true, minlength: 8 },


    refreshToken: { type: String, select: false },

    googleId:{
    type:String,
    unique:true,
    sparse:true


  }
  },
  { timestamps: true }
)

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10)
  }
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as SignOptions["expiresIn"] }
  )
}

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as SignOptions["expiresIn"] }
  )
}

export default mongoose.model<IUser>("User", userSchema)
