import { hashSync } from "bcrypt";
import User from "../../../DB/Models/users.models.js";
import mongoose from "mongoose";
import Message from "../../../DB/Models/message.model.js";
import { uploadFileCloudinary } from "../../../Common/Services/cloudinary.services.js";

// ================= UPDATE USER =================
export const updateUserService = async (req, res) => {
  const { user } = req.loggedInUser;
  const { firstName, lastName, email, password, age, gender } = req.body;

  const isNameExist = await User.findOne({ firstName, lastName });
  if (isNameExist && isNameExist._id.toString() !== user._id.toString()) {
    return res.status(400).json({ message: "Name already exists" });
  }

  const updateData = { firstName, lastName, email, age, gender };
  if (password) updateData.password = hashSync(password, +process.env.SALT_ROUNDS);

  const updatedUser = await User.findByIdAndUpdate(user._id, updateData, {
    new: true,
    runValidators: true
  }).select("-password");

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

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Internal server error", error });
  }
};

// ================= LIST USERS =================
export const listUserService = async (req, res) => {
  const users = await User.find().select("-password -otp").populate("messages");
  return res.status(200).json({ message: "Users list", users });
};

// ================= UPDATE PASSWORD =================
export const updatePasswordService = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { user } = req.loggedInUser;

    const foundUser = await User.findById(user._id);
    if (!foundUser) return res.status(404).json({ message: "User not found" });

    const isMatch = compareSync(oldPassword, foundUser.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    foundUser.password = hashSync(newPassword, +process.env.SALT_ROUNDS);
    await foundUser.save();

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error updating password", error });
  }
};


export const uploadProfieServices = async (req,res)=>{
  console.log('the file info uploaded',req.file);
  console.log('the user info uploaded',req.body);

  const {user:{_id}} = req.loggedInUser
  const {path} = req.file

  const result = await uploadFileCloudinary(path,{folder:'saraha_app/Users/Profiles',resource_type:'image'})

  const user = await User.findByIdAndUpdate(_id,{profileImage:result.secure_url},{new:true})
  return res.status(200).json({message:"profile uploaded successfully",user})
}

