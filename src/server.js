import express from "express";
import router from "./routes.js";
import { configDotenv } from "dotenv";
import db from "./db.js";

console.log(configDotenv());

const app = express();

app.use(express.json());
app.use("/api/v1", router);

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  db.query("SELECT NOW()");  // проверка подключения к базе
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
