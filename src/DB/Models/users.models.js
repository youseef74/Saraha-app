import mongoose from "mongoose";
import { genderEnum, roleEnum } from "../../Common/Enums/enums.js";
import { providerEnum } from "../../Middleware/authorization.middleware.js";


const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        trim:true,
        lowercase:true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        trim:true,
        lowercase:true,
    },
    email:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        index:{name:"idx_email",unique:true}
    },
    password:{
        type:String,
        trim:true
    },
    age:{
        type:Number,
        trim:true,
        minAge:[18,'age must be greater than 18'],
        maxAge:[60,'age must be less than 60'],
        index:true
    },
    gender:{
        type:String,
        enum:Object.values(genderEnum)
    },
    phoneNumber:{
        type:String,
    },
    otp:{
        confirmation:String,
        resetPassword:{
            type:String,
            expirationDate:Date
        }
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    role:{
        type:String,
        enum:Object.values(roleEnum),
        default:roleEnum.ADMIN
    },
    provider:{
        type:String,
        enum:Object.values(providerEnum),
        default:providerEnum.LOCAL
    },
    googleSub:String,
    profileImage:String
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