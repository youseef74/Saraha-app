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
import { signUpSchema } from "../../../Validators/Schemas/user.schema.js";
import { resetPasswordSchema } from "../../../Validators/Schemas/password-reset.schema.js";

const authController = Router();

authController.post('/signUp', validationMiddleware(signUpSchema), signUpService);
authController.put('/confirmUser', confirmUser);
authController.post('/signIn', signInService);
authController.post('/logout', authenticationMiddleware, logoutService);
authController.post('/signup-gmail', signUpServiceGmail);
authController.get('/refreshToken', authenticationMiddleware, refreshTokenService);
authController.post('/forget-password', validationMiddleware(resetPasswordSchema.forgetPassword), forgetPasswordService);
authController.post('/reset-password', validationMiddleware(resetPasswordSchema.resetPassword), resetPasswordService);




export default authController;
