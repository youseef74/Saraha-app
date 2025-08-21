import Joi from "joi";
import { genderEnum, skillLevelEnum } from "../../Common/Enums/enums.js";
import { isValidObjectId } from "mongoose";
import { generalRules } from "../../Utils/general-rules.utils.js";


const names = [
    "js",
    "python",
    "cpp",
    "ML"
]



export const signUpSchema =  {
    body:Joi.object({
        firstName:Joi.string().alphanum().min(3).max(20),
        lastName:Joi.string().alphanum().min(3).max(20),
        email:generalRules.email,
        password:generalRules.password,
        confirmPassword:Joi.string().valid(Joi.ref("password")),
        minAge:Joi.number().min(17),
        maxAge:Joi.number().max(60),
        age:Joi.number().min(Joi.ref("minAge")).max(Joi.ref("maxAge")),
        gender:Joi.string().valid(...Object.values(genderEnum)),
        phoneNumber:Joi.string().pattern(/^[0-9]{10}$/),
        isConfirmed:Joi.boolean().truthy("yes").falsy("no").sensitive(),
        // skillsName:Joi.array().items(Joi.string().valid(...names)).length(2),
        skills:Joi.array().items(Joi.object({
            name:Joi.string().valid(...names),
            level:Joi.string().valid(...Object.values(skillLevelEnum))
        })).length(2),
        // userId:Joi.custom(objectValidator),
        couponType:Joi.string().valid('fixed','percentage'),
        couponAmount:Joi.when("couponType",{
            is:Joi.string().valid('percentage'),
            then:Joi.number().max(100),
            otherwise:Joi.number().positive()
        }),

    }).options({
        presence:"required"
    })
    .with("email","password")
    .with("confirmPassword","password")
    .with("firstName","lastName")
    .with("minAge","maxAge")
    
}

