import { Schema, model } from "mongoose";

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  blog: {
    type: Schema.Types.ObjectId,
    ref: "Blog",
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export default model("Blog", blogSchema);
