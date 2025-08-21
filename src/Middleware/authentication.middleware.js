import User from "../DB/Models/users.models.js"
import BlackListTokens from "../DB/Models/black-list-tokens.models.js"
import { verifyToken } from "../Utils/tokens.utils.js"

export const authenticationMiddleware = async (req, res, next) => {
  const token = req.headers.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decodedData = verifyToken(token, process.env.JWT_SECRET_KEY);

  if (!decodedData.jti) {
    return res.status(401).json({ message: "invalid token" });
  }

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
    token: { tokenId: decodedData.jti, expirationDate: decodedData.exp } 
  };

  next();
};
