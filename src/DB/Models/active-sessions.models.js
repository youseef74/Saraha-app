import mongoose from "mongoose";


const activeSessionSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deviceId:{type:String,required:true},
    ipAddress:{type:String,required:true},
    tokenId:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
})

const ActiveSession = mongoose.model("ActiveSession",activeSessionSchema)

export default ActiveSession;