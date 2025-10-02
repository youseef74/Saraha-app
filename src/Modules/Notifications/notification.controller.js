import { Router } from "express";
import {  getNotificationsService, markNotificationAsReadService } from "./Services/notification.services.js";


const notificationController = Router();


notificationController.get('/getNotifications', getNotificationsService)

notificationController.put('/markAsRead/:notificationId', markNotificationAsReadService);


export default notificationController;