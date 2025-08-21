import mongoose from "mongoose";

export const blackListTokensSchema = new mongoose.Schema({
    tokenId:{type:String,required:true,unique:true},
    expirationDate:{type:Date,required:true}
}
)

const BlackListTokens = mongoose.model("BlackListTokens",blackListTokensSchema)

export default BlackListTokens
