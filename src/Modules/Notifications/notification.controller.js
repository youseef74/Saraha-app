import { Router } from "express";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
import {  getNotificationsService, markNotificationAsReadService } from "./Services/notification.services.js";


const notificationController = Router();


// Apply authentication middleware to all routes
notificationController.use(authenticationMiddleware);

notificationController.get('/getNotifications',  getNotificationsService)

notificationController.put('/markAsRead/:notificationId',  markNotificationAsReadService);


export default notificationController;