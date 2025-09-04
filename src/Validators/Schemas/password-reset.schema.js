import Joi from "joi";
import { generalRules } from "../../Utils/general-rules.utils.js";
import { isValidObjectId } from "mongoose";

const objectValidator = (value, helpers) => {
    return isValidObjectId(value) ? true : helpers.message("Invalid object id");
};

export const resetPasswordSchema = {
    forgetPassword: Joi.object({
        email: generalRules.email.required().messages({
            'any.required': 'Email is required',
            'string.email': 'Please provide a valid email address'
        })
    }),

    resetPassword: Joi.object({
        userId: Joi.string().custom(objectValidator).required().messages({
            'any.required': 'User ID is required',
            'custom': 'Invalid user ID format'
        }),
        otp: Joi.string().length(6).pattern(/^[0-9A-Z]{6}$/).required().messages({
            'any.required': 'OTP is required',
            'string.length': 'OTP must be exactly 6 characters',
            'string.pattern.base': 'OTP must contain only numbers and uppercase letters'
        }),
        newPassword: generalRules.password.required().messages({
            'any.required': 'New password is required',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
        }),
        confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
            'any.required': 'Please confirm your password',
            'any.only': 'Passwords do not match'
        })
    }).with('newPassword', 'confirmPassword')
};