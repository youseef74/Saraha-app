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
import Session from "../../../DB/Models/session.model.js";


const uniqueString = customAlphabet('gfdgdfgfhdadd', 6);

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
    subject: "Confirmation email",
    content: `<h1>Your OTP is ${otp}</h1>`
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
  const { email, password, deviceId } = req.body; // لازم يجي من client
  const user = await User.findOne({ email });

  if (!user || !compareSync(password, user.password)) {
    return res.status(404).json({ message: "Invalid email or password" });
  }

  let sessions = await Session.find({ userId: user._id });
  const existingSession = sessions.find(s => s.deviceId === deviceId);

  if (!existingSession && sessions.length >= 2) {
    return res.status(403).json({
      message: "You can only login from 2 devices. Please logout from another device first."
    });
  }

  const tokenId = uuidv4();
  const token = generateToken(
    { userId: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRATION_TIME, jwtid: tokenId }
  );

  const refreshToken = generateToken(
    { userId: user._id, email: user.email },
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION, jwtid: uuidv4() }
  );

  if (!existingSession) {
    await Session.create({ userId: user._id, deviceId, tokenId });
  } else {
    existingSession.tokenId = tokenId;
    await existingSession.save();
  }

  return res.status(200).json({
    message: "User signed in successfully",
    user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    token,
    refreshToken
  });
};
// ================= LOGOUT =================
export const logoutService = async (req, res) => {
  const { token: { tokenId }, user: { _id }, deviceId } = req.loggedInUser;

  await Session.deleteOne({ userId: _id, deviceId, tokenId });

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
  const { refreshtoken } = req.headers;
  const decodedData = verifyToken(refreshtoken, process.env.JWT_REFRESH_TOKEN_SECRET_KEY);

  if (!decodedData.jti) {
    return res.status(401).json({ message: "Invalid token" });
  }

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

  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 10);

  await ResetPassword.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, token: hashedOtp, expirationDate },
    { upsert: true, new: true }
  );

  emitter.emit("sendEmail", {
    to: email,
    subject: "Reset Password OTP",
    content: `
      <h2>Password Reset Request</h2>
      <p>You have requested to reset your password. Use the following OTP to proceed:</p>
      <h3>${otp}</h3>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });

  return res.status(200).json({
    message: "Password reset OTP sent to your email",
    userId: user._id
  });
};

// ================= RESET PASSWORD =================
export const resetPasswordService = async (req, res) => {

  const { userId, otp, newPassword } = req.body;

  const resetRecord = await ResetPassword.findOne({ userId });
  if (!resetRecord) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  if (resetRecord.expirationDate < new Date()) {
    await ResetPassword.deleteOne({ userId });
    return res.status(400).json({ message: "OTP has expired" });
  }

  const isOtpValid = compareSync(otp, resetRecord.token);
  if (!isOtpValid) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const hashedPassword = hashSync(newPassword, +process.env.SALT_ROUNDS);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  await ResetPassword.deleteOne({ userId });

  return res.status(200).json({ message: "Password reset successfully" });
};
