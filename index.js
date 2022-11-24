import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import * as dotenv from 'dotenv'
dotenv.config()

const app = express();

app.use(cors());
app.use(routes);

app.get("/", async ({ res }) => {
  res.status(200).json({ msg: 'Welcome to my API, for a my personal project named dashboard' });
});

app.listen(8080);

export default app;
