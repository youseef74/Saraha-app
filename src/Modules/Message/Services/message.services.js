import Message from "../../../DB/Models/message.model.js";
import User from "../../../DB/Models/users.models.js";
import Notification from "../../../DB/Models/notification.model.js";

// ================= SEND MESSAGE =================
export const sendMessageService = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { receiverId } = req.params;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }
    const messageInstance = new Message({
        content,
        receiverId
    })
    await messageInstance.save()

    return res.status(200).json({message:"Message sent successfully",messageInstance})
  } catch (error) {
    next(error);
  }
}

export const getMessagesService = async(req,res)=>{
    const messages = await Message.find().populate({
        path:"receiverId"
    })
    return res.status(200).json({message:"Messages fetched successfully",messages})
}