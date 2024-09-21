import express from "express";
import router from "./routes.js";
import { configDotenv } from "dotenv";
import db from "./db.js";
import path from "path";

console.log("Config loaded", configDotenv());

const app = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(path.join(import.meta.dirname, "templates")));

app.use(
  "/static/",
  express.static(path.resolve(path.join(import.meta.dirname, "static")))
);

app.use("/bootstrap", express.static(path.join(import.meta.dirname, "../node_modules/bootstrap/dist")));

app.use(express.json());
app.use("/api/v1", router);

app.get("/", (req, res) => {
  res.sendFile(
    path.resolve(import.meta.dirname, path.join("templates", "index.html"))
  );
});

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  db.query("SELECT NOW()"); // проверка подключения к базе
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
