import { Router } from "express";
import {
  getMessagesService,
  sendMessageService,
  makeMessagePublicService,
  getPublicMessagesService,
  getMessagesLoggedInService,
  addReactionService,
  deleteMessageService,
} from "./Services/message.services.js";
import { authenticationMiddleware } from "../../Middleware/authentication.middleware.js";

const messageController = Router()

messageController.post('/sendMessage/:receiverId', sendMessageService)
messageController.get('/getMessages', getMessagesService)
messageController.put('/makePublic/:messageId', authenticationMiddleware, makeMessagePublicService)
messageController.get('/getAllPublicMessages', getPublicMessagesService)
messageController.get('/getAllMessagesForUserLoggedIn', authenticationMiddleware, getMessagesLoggedInService)
messageController.post('/:messageId/reactions', addReactionService)
messageController.delete('/deleteMessage/:messageId', authenticationMiddleware, deleteMessageService)

export default messageController;
