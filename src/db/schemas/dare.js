const mongoose = require("mongoose");

const dareDbSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["question", "dare"], required: true },
    text: { type: String, required: true, trim: true },
    img: { type: String },
    password: { type: String, required: true },
    email: { type: String, required: true, trim: true, index: true },
    phone: { type: String, required: true, trim: true, index: true },
    role: { type: String, default: "user", enum: ["admin", "user"] },
    firebaseToken: { type: String },
  },
  { timestamps: true }
);

dareDbSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.__v;
  },
});

const Dare = mongoose.model("User", dareDbSchema);
module.exports = Dare;
