import { Router } from "express";
import { 
  getMessagesService, 
  sendMessageService,
  makeMessagePublicService, 
  getAllPublicMessagesService,
  getAllMessageForUserLoggedInService
} from "./Services/message.services.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";
const messageController = Router();

messageController.post('/sendMessage/:receiverId', sendMessageService);

messageController.get('/getMessages', getMessagesService);

messageController.put('/makepublic/:id', makeMessagePublicService);

messageController.get('/getAllPublicMessages', getAllPublicMessagesService);

messageController.get('/getAllMessagesForUserLoggedIn', authenticationMiddleware, getAllMessageForUserLoggedInService);

export default messageController;
