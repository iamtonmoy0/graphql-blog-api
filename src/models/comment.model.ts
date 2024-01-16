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
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
});

export default model("Comment", commentModel);
