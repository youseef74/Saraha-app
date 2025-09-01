import { Router } from "express";
import {
  updateUserService,
  deleteUserService,
  listUserService,
  updatePasswordService,
  uploadProfieServices
} from "../Services/users.services.js";

import { authenticationMiddleware } from "../../../Middleware/authentication.middleware.js";
import { authorizationMiddleware } from "../../../Middleware/authorization.middleware.js";
import { privillage } from "../../../Common/Enums/enums.js";
import { hostUpload} from "../../../Middleware/multer.middleware.js";


const userController = Router();

userController.put('/updateUser', authenticationMiddleware, updateUserService);
userController.delete('/deleteUser/:userId', authenticationMiddleware, deleteUserService);
userController.put('/updatePassword', authenticationMiddleware, updatePasswordService);
userController.post('/uploadProfile',authenticationMiddleware,hostUpload({}).single('profile'),uploadProfieServices)


userController.get(
  '/listUsers',
  authenticationMiddleware,
  authorizationMiddleware(privillage.ADMIN),
  listUserService
);

export default userController;
