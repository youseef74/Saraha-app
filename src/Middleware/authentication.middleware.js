import User from "../DB/Models/users.models.js"
import BlackListTokens from "../DB/Models/black-list-tokens.models.js"
import { verifyToken } from "../Utils/tokens.utils.js"

export const authenticationMiddleware = async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];

  const decodedData = verifyToken(token, process.env.JWT_SECRET_KEY);
  console.log("decodedData:", decodedData);

  if (!decodedData || !decodedData.jti) {
    return res.status(401).json({ message: "invalid token" });
  }

  //  Check blacklisted
  const isTokenBlackListed = await BlackListTokens.findOne({ tokenId: decodedData.jti });
  if (isTokenBlackListed) {
    return res.status(401).json({ message: "Token blacklisted" });
  }

  const user = await User.findById(decodedData?.userId).lean();
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }

  req.loggedInUser = { 
    user, 
    token: { tokenId: decodedData.jti, expirationDate: decodedData.exp },
    deviceId: activeSession.deviceId  
  };

  next();
};

export const authorizationMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    const { user: { role } } = req.loggedInUser;

    if (allowedRoles.includes(role)) {
      return next();
    }

    return res.status(401).json({ message: "Unauthorized" });
  };
};

export const providerEnum = {
  GOOGLE: "GOOGLE",
  LOCAL: "LOCAL"
};
