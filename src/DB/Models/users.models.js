import mongoose from "mongoose";
import { genderEnum, roleEnum } from "../../Common/Enums/enums.js";


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:20
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        index:{name:"idx_email",unique:true}
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        required:true,
        trim:true,
        minAge:[18,'age must be greater than 18'],
        maxAge:[60,'age must be less than 60'],
        index:true
    },
    gender:{
        type:String,
        required:true,
        enum:Object.values(genderEnum),
    },
    phoneNumber:{
        type:String,
        required:true
    },
    otp:{
        confirmation:String,
        resetPassword:String
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:Object.values(roleEnum),
        default:roleEnum.ADMIN
    }
},{
    timestamps:true,
    toObject:{
        virtuals:true
    },
    toJSON:{
        virtuals:true
    },
    virtuals:{
        fullName:{
            get(){
                return `${this.firstName} ${this.lastName}`
            }
        }
    },
    methods:{
        getFullName(){
            return `${this.firstName} ${this.lastName}`
        },
        getDoubleAge(){
            return `${this.age * 2}`
        }
    }
})

userSchema.index({firstName:1,lastName:1},{name:"idx_fullName",unique:true})


userSchema.virtual("Message",{
    ref:"Message",
    localField:"_id",
    foreignField:"receiverId"
})

const User = mongoose.model("User",userSchema)

export default User