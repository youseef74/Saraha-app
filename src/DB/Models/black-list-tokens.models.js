import mongoose from "mongoose";

export const blackListTokensSchema = new mongoose.Schema({
    tokenId:{type:String,required:true,unique:true},
    expirationDate: { 
        type: Date, 
        required: true, 
        index: { expires: 0 } 
      }
    
}
)

const BlackListTokens = mongoose.model("BlackListTokens",blackListTokensSchema)

export default BlackListTokens
