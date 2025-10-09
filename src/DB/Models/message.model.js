import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    content:{type:String,required:true},
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    isPublic: { type: Boolean, default: false },
    reactions: [{ type: String }]
    },
    {
        timestamps:true
    }
)

const Message = mongoose.model("Message",messageSchema)

export default Message