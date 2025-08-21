import { compareSync, hashSync } from "bcrypt";
import User from "../../../DB/Models/users.models.js";
import { asymmetricEncrypt } from "../../../Utils/encryption.utils.js";
import { emitter } from "../../../Utils/send-mail.utils.js";
import { customAlphabet } from 'nanoid';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, verifyToken } from "../../../Utils/tokens.utils.js";
import BlackListTokens from "../../../DB/Models/black-list-tokens.models.js";
import mongoose from "mongoose";
import Message from "../../../DB/Models/message.model.js";

const uniqueString = customAlphabet('gfdgdfgfhdadd', 6);

// ================= SIGN UP =================
export const signUpService = async (req, res) => {
  const { firstName, lastName, email, password, age, gender, phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  const isUserExist = await User.findOne({
    $or: [{ email }, { firstName, lastName }]
  });

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
    content: `<h1>Your OTP is ${otp}</h1>`,
    attachments: [{ fileName: 'image.jpg', path: './src/image.jpg' }]
  });

  await userInstance.save();

  return res.status(201).json({ message: "User created successfully", userInstance });
};

// ================= CONFIRM USER =================
export const confirmUser = async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new Error("User not found or already confirmed", { cause: 400 }));
  }

  const isOtpMatched = compareSync(otp, user.otp?.confirmation);
  if (!isOtpMatched) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isConfirmed = true;
  user.otp.confirmation = undefined;
  await user.save();

  return res.status(200).json({ message: "User confirmed successfully", user });
};

// ================= SIGN IN =================
export const signInService = async (req, res) => {
  const { email, password } = req.body;
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

  res.status(200).json({ message: "User signed in successfully", token, refreshToken });
};

// ================= UPDATE USER =================
export const updateUserService = async (req, res) => {
  const { user } = req.loggedInUser;
  const { firstName, lastName, email, password, age, gender } = req.body;

  const isNameExist = await User.findOne({ firstName, lastName });
  if (isNameExist && isNameExist._id.toString() !== user._id.toString()) {
    return res.status(400).json({ message: "Name already exists" });
  }

  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    {
      firstName,
      lastName,
      email,
      password: password ? hashSync(password, +process.env.SALT_ROUNDS) : undefined,
      age,
      gender
    },
    { new: true, runValidators: true }
  );

  return res.status(200).json({ message: "User updated successfully", updatedUser });
};

// ================= DELETE USER =================
export const deleteUserService = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;

    const deletedResult = await User.findByIdAndDelete(userId, { session });
    if (!deletedResult) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    await Message.deleteMany({ receiverId: userId }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "User deleted successfully", deletedResult });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// ================= LIST USERS =================
export const listUserService = async (req, res) => {
  const users = await User.find().populate("messages"); // عدل populate على حسب اسم ref في schema
  return res.status(200).json({ message: "Users list", users });
};

// ================= LOGOUT =================
export const logoutService = async (req, res) => {
  const { token: { tokenId, expirationDate }, user: { _id } } = req.loggedInUser;

  const blackListTokenInstance = new BlackListTokens({
    tokenId,
    expirationDate: new Date(expirationDate * 1000),
    userId: _id
  });

  await blackListTokenInstance.save();

  return res.status(200).json({ message: "Token blacklisted successfully", blackListTokenInstance });
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

// ================= UPDATE PASSWORD =================
export const updatePasswordService = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { user } = req.loggedInUser;

    const foundUser = await User.findById(user._id);
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = compareSync(oldPassword, foundUser.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    foundUser.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
    await foundUser.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating password", error });
  }
};
