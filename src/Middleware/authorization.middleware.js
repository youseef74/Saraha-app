

export const authorizationMiddleware = (allwoedRoles)=>{
    return (req,res,next)=>{
        const {user:{role}} = req.loggedInUser

        

        if(allwoedRoles.includes(role)){
            next()

        }
        return res.status(401).json({message:"Unauthorized"})
    }
}

export const providerEnum = {
    GOOGLE: "GOOGLE",
    LOCAL: "LOCAL"
}
