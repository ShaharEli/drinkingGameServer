const mongoose = require("mongoose");

const userDbSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: false },
    lastConnected: { type: Date, default: new Date() },
    socketId: { type: String },
    avatar: { type: String },
    password: { type: String, required: true },
    email: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    role: { type: String, default: "user", enum: ["admin", "user"] },
    firebaseToken: { type: String },
  },
  { timestamps: true }
);

userDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const User = mongoose.model("User", userDbSchema);
User.createIndexes();
module.exports = User;
