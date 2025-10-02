

export const authorizationMiddleware = (allowedRoles)=>{
    return (req,res,next)=>{
        const {user:{role}} = req.loggedInUser

        

        if(allowedRoles.includes(role)){
            return next()

        }
        return res.status(403).json({message:"Forbidden"})
    }
}

export const providerEnum = {
    GOOGLE: "GOOGLE",
    LOCAL: "LOCAL"
}
