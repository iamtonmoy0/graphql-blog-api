import Express from "express";
import { config } from "dotenv";
import { dbConnection } from "./db/dbConnection";
import schema from "./handlers/handlers";
import { graphqlHTTP } from "express-graphql";
// configs
config();
// initialize the application
const app = Express();

// db connection
dbConnection();

app.use("/graphql", graphqlHTTP({ schema: schema, graphiql: true }));

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port : ${process.env.PORT}`);
});
