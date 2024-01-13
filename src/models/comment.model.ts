import { Schema, model } from "mongoose";

const commentModel = new Schema({
  text: {
    type: String,
    required: [true, "can't be blank"],
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
});

export default model("Comment", commentModel);
