import { Router } from "express";
import { confirmUser, deleteUserService, listUserService, logoutService, refreshTokenService, signInService, signUpService, updatePasswordService, updateUserService } from "./Services/users.services.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import { privillage, roleEnum } from "../../Common/Enums/enums.js";
import { authorizationMiddleware } from "../../Middleware/authorization.middleware.js";
import { validationMiddleware } from "../../Middleware/validation.middleware.js";
import { signUpSchema } from "../../Validators/Schemas/user.schma.js";

const userController = Router()

userController.post('/signUp',validationMiddleware(signUpSchema),signUpService)
userController.post('/signIn',signInService)
userController.put('/updateUser',authenticationMiddleware,updateUserService)
userController.post('/logout',authenticationMiddleware,logoutService)
userController.delete('/deleteUser/:userId',deleteUserService)

userController.get('/listUsers',
    authenticationMiddleware,
    authorizationMiddleware(privillage.ADMIN),
    listUserService)
    
userController.put('/confirmUser',confirmUser)
userController.get('/refreshToken',authenticationMiddleware,refreshTokenService)
userController.put('/updatePassword',authenticationMiddleware,updatePasswordService)











export default userController