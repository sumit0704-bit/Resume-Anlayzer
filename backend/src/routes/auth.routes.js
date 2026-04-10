const { Router } = require('express');
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const authRouter = Router();

// Endpoint: POST /api/auth/register
authRouter.post("/register", authController.registerUserController);

// Endpoint: POST /api/auth/login
authRouter.post("/login", authController.loginUserController);

// Endpoint: GET /api/auth/logout
authRouter.get("/logout", authController.logoutUserController);

// Endpoint: GET /api/auth/get-me
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = authRouter;