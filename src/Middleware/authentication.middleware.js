import User from "../DB/Models/users.models.js";
import BlackListTokens from "../DB/Models/black-list-tokens.models.js";
import Session from "../DB/Models/session.model.js";  
import { verifyToken } from "../Utils/tokens.utils.js";

export const authenticationMiddleware = async (req, res, next) => {
  let token = req.headers.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized, token missing" });
  }

  const decodedData = verifyToken(token, process.env.JWT_SECRET_KEY);

  if (!decodedData.jti) {
    return res.status(401).json({ message: "invalid token" });
  }

  //  Check blacklisted
  const isTokenBlackListed = await BlackListTokens.findOne({ tokenId: decodedData.jti });
  if (isTokenBlackListed) {
    return res.status(401).json({ message: "Token blacklisted" });
  }

  //  Check active session
  const activeSession = await Session.findOne({
    userId: decodedData.userId,
    tokenId: decodedData.jti
  });
  if (!activeSession) {
    return res.status(401).json({ message: "Session not valid, please login again" });
  }

  //  Attach user
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
