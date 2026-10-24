import { Types } from "mongoose"

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by the authMiddleware (src/middlewares/auth.middleware.ts),
       * which attaches the password/refreshToken-free User document.
       * Declared as required so handlers behind the middleware can read
       * req.user directly; routes that don't use it never have one at runtime.
       */
      user: {
        _id: Types.ObjectId
        email: string
        username: string
      }
    }
  }
}

export {}
