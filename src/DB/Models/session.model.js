import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceId: { type: String, required: true },
  tokenId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
