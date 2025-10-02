

export const authorizationMiddleware = (allwoedRoles)=>{
    return (req,res,next)=>{
        const {user:{role}} = req.loggedInUser

        

        if(allwoedRoles.includes(role)){
            return next()

        }
        console.log('role:', role, 'allowed:', allwoedRoles)
        return res.status(403).json({message:"Forbidden"})
    }
}

export const providerEnum = {
    GOOGLE: "GOOGLE",
    LOCAL: "LOCAL"
}
