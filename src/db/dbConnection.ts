import mongoose from "mongoose";

export const dbConnection = async () => {
  try {
    await mongoose
      .connect(process.env.DB)
      .then(() => {
        console.log("Connected to mongodb");
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (error) {
    console.log(error);
  }
};
