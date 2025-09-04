import Message from "../../../DB/Models/message.model.js";
import User from "../../../DB/Models/users.models.js";


export const sendMessageService = async(req,res)=>{
    const {content}= req.body
    const {receiverId} = req.params


    const receiver = await User.findById(receiverId)
    if(!receiver){
        return res.status(404).json({message:"Receiver not found"})
    }
    const messageInstance = new Message({
        content,
        receiverId
    })
    await messageInstance.save()

    return res.status(200).json({message:"Message sent successfully",messageInstance})
}


export const getMessagesService = async(req,res)=>{
    const messages = await Message.find().populate({
        path:"receiverId"
    })
    return res.status(200).json({message:"Messages fetched successfully",messages})
}

export const makeMessagePublicService = async (req, res, next) => {
    try {
      const { id } = req.params;
      console.log("➡️ makePublic id:", id);  
  
      const message = await Message.findById(id);
      if (!message) {
        console.log(" Message not found in DB");
        return res.status(404).json({ message: "Message not found" });
      }
  
      message.isPublic = true;
      await message.save();
  
      return res.status(200).json({
        message: "Message is now public ",
        data: message
      });
    } catch (err) {
      next(err);
    }
  };
  
export const getAllPublicMessagesService = async (req,res,next)=>{
  const publicMessages = await Message.find({isPublic:true})
  return res.status(200).json({message:"Public messages fetched successfully",publicMessages})
}

export const getAllMessageForUserLoggedInService = async (req,res,next)=>{
  const  userId = req.loggedInUser.user._id
  const messages = await Message.find({receiverId:userId})

  return res.status(200).json({message:"Messages fetched successfully",messages})
}