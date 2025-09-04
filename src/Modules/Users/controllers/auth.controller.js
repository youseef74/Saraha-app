import { Router } from "express";
import {
  signUpService,
  signInService,
  signUpServiceGmail,
  confirmUser,
  logoutService,
  refreshTokenService,
  forgetPasswordService,
  resetPasswordService,
} from "../Services/auth.services.js";

import { authenticationMiddleware } from "../../../Middleware/authentication.middleware.js";
import { validationMiddleware } from "../../../Middleware/validation.middleware.js";
import { signUpSchema } from "../../../Validators/Schemas/user.schma.js";

const authController = Router();








// debug
console.log("✅ auth.controller.js loaded");

authController.use((req, res, next) => {
  console.log("➡️ Auth route hit:", req.method, req.originalUrl);
  next();
});

authController.post('/signUp', validationMiddleware(signUpSchema), signUpService);
authController.post('/signIn', signInService);
authController.post('/signup-gmail', signUpServiceGmail);
authController.put('/confirmUser', confirmUser);

authController.post('/logout', authenticationMiddleware, logoutService);
authController.get('/refreshToken', authenticationMiddleware, refreshTokenService);


authController.post('/reset-password', resetPasswordService);
authController.post('/forget-password', forgetPasswordService);


export default authController;
