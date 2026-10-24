import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateUser } from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authMiddleware, logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/update", authMiddleware, updateUser);
router.post("/refresh-token", refreshAccessToken);

export default router;
