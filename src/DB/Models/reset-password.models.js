import mongoose from "mongoose";

export const resetPasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  token: {
    type: String,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

resetPasswordSchema.index({ userId: 1, token: 1 });

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);
export default ResetPassword;
