import { Schema } from "mongoose"



const reqKeys = ['body','params','query','headers']


export const validationMiddleware = (Schema)=>{
    return(req,res,next)=>{

        const validationErrors = []
        for(const key of reqKeys){
            console.log(key);
            
            if(Schema[key]){
                const {error} = Schema[key].validate(req[key],{abortEarly:false})
                if(error){
                    validationErrors.push(...error.details)
                    
                }
                
            }
        }
        if(validationErrors.length>0){
            return res.status(400).json({message:"Validation failed",validationErrors})
        }
        next()
    }
}