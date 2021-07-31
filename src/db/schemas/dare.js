const mongoose = require("mongoose");

const dareDbSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["question", "dare"], required: true },
    text: { type: String, required: true, trim: true },
    img: { type: String },
    punishment: { type: String, required: true, trim: true },
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
