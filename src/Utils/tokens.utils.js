import jwt from 'jsonwebtoken'


//generateToken

export const generateToken = (payload,secret,options)=>{
    return jwt.sign(payload,secret,options)
}

//verifyToken
export const verifyToken = (token,secret)=>{
    return jwt.verify(token,secret)
}
