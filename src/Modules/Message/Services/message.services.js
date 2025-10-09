import Message from "../../../DB/Models/message.model.js";
import User from "../../../DB/Models/users.models.js";
import Notification from "../../../DB/Models/notification.model.js";
import { createNotificationService } from "../../Notifications/Services/notification.services.js";

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

    // notify receiver
    try { await createNotificationService(receiverId, "You received a new message"); } catch (e) { /* swallow notification errors */ }

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

// ================= MAKE MESSAGE PUBLIC =================
export const makeMessagePublicService = async (req, res) => {
  const { messageId } = req.params;
  const updated = await Message.findByIdAndUpdate(
    messageId,
    { isPublic: true },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Message not found" });
  try { await createNotificationService(updated.receiverId, "Your message was made public"); } catch (e) {}
  return res.status(200).json({ message: "Message made public", messageInstance: updated });
};

// ================= GET PUBLIC MESSAGES =================
export const getPublicMessagesService = async (req, res) => {
  const messages = await Message.find({ isPublic: true }).populate({ path: 'receiverId' });
  return res.status(200).json({ message: "Public messages fetched successfully", messages });
};

// ================= GET LOGGED-IN USER MESSAGES =================
export const getMessagesLoggedInService = async (req, res) => {
  const userId = req.loggedInUser?.user?._id || req.loggedInUser?.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const messages = await Message.find({ receiverId: userId }).sort({ createdAt: -1 });
  return res.status(200).json({ message: "Messages fetched successfully", messages });
};

// ================= ADD REACTION =================
export const addReactionService = async (req, res) => {
  const { messageId } = req.params;
  const { reaction } = req.body;
  if (!reaction) return res.status(400).json({ message: "reaction is required" });
  const updated = await Message.findByIdAndUpdate(
    messageId,
    { $addToSet: { reactions: reaction } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Message not found" });
  try { await createNotificationService(updated.receiverId, `Your message got a reaction: ${reaction}`); } catch (e) {}
  return res.status(200).json({ message: "Reaction added", messageInstance: updated });
};

// ================= DELETE MESSAGE =================
export const deleteMessageService = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.loggedInUser?.user?._id || req.loggedInUser?.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const message = await Message.findOne({ _id: messageId, receiverId: userId });
  if (!message) return res.status(404).json({ message: "Message not found" });
  await Message.deleteOne({ _id: messageId });
  return res.status(200).json({ message: "Message deleted" });
};


