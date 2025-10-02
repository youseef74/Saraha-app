import { Router } from "express";
import { getMessagesService, sendMessageService } from "./Services/message.services.js";

const messageController = Router()

messageController.post('/sendMessage/:receiverId',sendMessageService)
messageController.get('/getMessages',getMessagesService)

export default messageController;
