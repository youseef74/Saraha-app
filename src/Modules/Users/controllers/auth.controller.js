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

const authController = Router();

authController.post('/signUp', validationMiddleware(signUpSchema), signUpService);
authController.post('/signIn', signInService);
authController.post('/signup-gmail', signUpServiceGmail);
authController.put('/confirmUser', confirmUser);

authController.post('/logout', authenticationMiddleware, logoutService);
authController.get('/refreshToken', authenticationMiddleware, refreshTokenService);

export default authController;
