import { Router } from "express";
import { registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  updateAccount,
  getCurrentUser,} from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/auth.middleware"
import { registerSchema,loginSchema, updateAccountSchema  } from "../validators/user.validator";

const router = Router();

router.post("/register", validateRequest(registerSchema),registerUser);
router.post("/login", validateRequest(loginSchema),loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/update", authMiddleware,validateRequest(updateAccountSchema), updateAccount);
router.post("/refresh-token", refreshAccessToken);

export default router;
