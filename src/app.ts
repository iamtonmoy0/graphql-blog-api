import Express from "express";
import { config } from "dotenv";
import { dbConnection } from "./db/dbConnection";
// configs
config();
// initialize the application
const app = Express();

// db connection
dbConnection();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port : ${process.env.PORT}`);
});
