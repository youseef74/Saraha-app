import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/Models/users.models.js";
import { asymmetricEncrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Utils/send-mail.utils.js";
import { customAlphabet } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js";
import BlackListTokens from "../../../DB/Models/black-list-tokens.models.js";
import { OAuth2Client } from 'google-auth-library';
import ResetPassword from "../../../DB/Models/reset-password.models.js";

const uniqueString = customAlphabet('12345678909425', 6);

// ================= SIGN UP =================
export const signUpService = async (req, res) => {
  const { firstName, lastName, email, password, age, gender, phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const isUserExist = await User.findOne({ $or: [{ email }, { firstName, lastName }] });
  if (isUserExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  const otp = uniqueString();
  const encryptedPhoneNumber = asymmetricEncrypt(phoneNumber);
  const hashedPassword = hashSync(password, +process.env.SALT_ROUNDS);

  const userInstance = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    age,
    gender,
    phoneNumber: encryptedPhoneNumber,
    otp: { confirmation: hashSync(otp, +process.env.SALT_ROUNDS) }
  });

emitter.emit('sendEmail', {
  to: email,
  subject: "Email Confirmation - Your OTP Code",
  content: `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px;">
    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      
      <h2 style="text-align:center; color:#4CAF50;">🔒 Email Verification</h2>
      
      <p style="font-size:16px; color:#333;">Hello,</p>
      <p style="font-size:15px; color:#555;">
        Please use the following OTP code to confirm your email address:
      </p>
      
      <div style="text-align:center; margin:20px 0;">
        <span style="display:inline-block; background:#4CAF50; color:#fff; font-size:28px; font-weight:bold; padding:15px 30px; border-radius:8px; letter-spacing:5px;">
          ${otp}
        </span>
      </div>
      
      <p style="font-size:14px; color:#555;">⚠️ This OTP is valid for <b>10 minutes</b>.</p>
      <p style="font-size:14px; color:#999;">If you didn’t request this, you can safely ignore this email.</p>
      
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
      
      <p style="font-size:12px; text-align:center; color:#aaa;">
        &copy; ${new Date().getFullYear()} Saraha App. All rights reserved.
      </p>
    </div>
  </div>
  `
});


  await userInstance.save();

  const userData = userInstance.toObject();
  delete userData.password;
  delete userData.otp;

  return res.status(201).json({ message: "User created successfully", user: userData });
};

// ================= CONFIRM USER =================
export const confirmUser = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return next(new Error("User not found or already confirmed", { cause: 400 }));

  const isOtpMatched = compareSync(otp, user.otp?.confirmation);
  if (!isOtpMatched) return res.status(400).json({ message: "Invalid OTP" });

  user.isConfirmed = true;
  user.otp.confirmation = undefined;
  await user.save();

  const userData = user.toObject();
  delete userData.password;
  delete userData.otp;

  return res.status(200).json({ message: "User confirmed successfully", user: userData });
};

// ================= SIGN IN =================
export const signInService = async (req, res) => {
  const { email, password, deviceId } = req.body; 
  const user = await User.findOne({ email });

  if (!user || !compareSync(password, user.password)) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  const token = generateToken(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRATION_TIME, jwtid: uuidv4() }
  );

  const refreshToken = generateToken(
    { userId: user._id, email: user.email },
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION, jwtid: uuidv4() }
  );

  return res.status(200).json({
    message: "User signed in successfully",
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    token,
    refreshToken
  });
};
// ================= LOGOUT =================
export const logoutService = async (req, res) => {
  const { token: { tokenId, expirationDate }, user: { _id } } = req.loggedInUser;

  const blackListTokenInstance = new BlackListTokens({
    tokenId,
    expirationDate: new Date(req.loggedInUser.token.expirationDate * 1000),
    userId: _id
  });

  await blackListTokenInstance.save();

  return res.status(200).json({ message: "Logged out successfully" });
};

// ================= REFRESH TOKEN =================
export const refreshTokenService = async (req, res) => {
  let refreshToken = req.headers.refreshtoken;
  const authHeader = req.headers.authorization;
  if (!refreshToken && authHeader && authHeader.startsWith('Bearer ')) {
    refreshToken = authHeader.split(' ')[1];
  }

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  const decodedData = verifyToken(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

  if (!decodedData || !decodedData.jti) return res.status(401).json({ message: "Invalid token" });

  const token = generateToken(
    { userId: decodedData.userId, email: decodedData.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRATION_TIME, jwtid: uuidv4() }
  );

  return res.status(200).json({ message: "Token generated successfully", token });
};

// ================= GOOGLE SIGNUP =================
export const signUpServiceGmail = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken is missing" });

  try {
    const client = new OAuth2Client(process.env.WEB_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.WEB_CLIENT_ID });
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        password: hashSync(uuidv4(), +process.env.SALT_ROUNDS),
        isConfirmed: true,
        provider: "GOOGLE"
      });
    }

    const token = generateToken(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: process.env.JWT_EXPIRATION_TIME, jwtid: uuidv4() }
    );

    const refreshToken = generateToken(
      { userId: user._id, email: user.email },
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
      { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION, jwtid: uuidv4() }
    );

    return res.status(200).json({
      message: "User signed in with Google successfully",
      user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
      token,
      refreshToken
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token", error: error.message });
  }
};

// ================= FORGET PASSWORD =================
export const forgetPasswordService = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const otp = uniqueString();
  const hashedOtp = hashSync(otp, +process.env.SALT_ROUNDS);
  const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await ResetPassword.findOneAndUpdate(
    { userId: user._id },
    { token: hashedOtp, expirationDate },
    { upsert: true, new: true }
  );

  emitter.emit('sendEmail', {
    to: email,
    subject: 'Password Reset OTP',
    content: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 30px;">
        <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <h2 style="text-align:center; color:#4CAF50;">Reset Your Password</h2>
          <p>Use this OTP to reset your password. It expires in 10 minutes.</p>
          <div style="text-align:center; margin:20px 0;">
            <span style="display:inline-block; background:#4CAF50; color:#fff; font-size:28px; font-weight:bold; padding:15px 30px; border-radius:8px; letter-spacing:5px;">${otp}</span>
          </div>
        </div>
      </div>
    `
  });

  return res.status(200).json({ message: 'OTP sent to email' });
};

// ================= RESET PASSWORD =================
export const resetPasswordService = async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  const resetDoc = await ResetPassword.findOne({ userId });
  if (!resetDoc) {
    return res.status(400).json({ message: 'No reset request found' });
  }

  if (resetDoc.expirationDate < new Date()) {
    await ResetPassword.deleteOne({ _id: resetDoc._id });
    return res.status(400).json({ message: 'OTP expired' });
  }

  const isValid = compareSync(otp, resetDoc.token);
  if (!isValid) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
  await User.updateOne({ _id: userId }, { $set: { password: hashedPassword } });

  await ResetPassword.deleteOne({ _id: resetDoc._id });

  return res.status(200).json({ message: 'Password reset successfully' });
};
