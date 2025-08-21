import Joi from "joi";
import { isValidObjectId } from "mongoose";

function objectValidator(value,helper){
    return isValidObjectId(value)?true:helper.message("Invalid object id")
}

export const generalRules = {
    email:Joi.string().email(),
    password:Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#])[A-Za-z\d@$!%*#]{8,}$/).message({
        "string.pattern.base":"Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
    }),

}