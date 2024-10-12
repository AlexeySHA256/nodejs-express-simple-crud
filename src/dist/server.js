import express from "express";
import bodyParser from "body-parser";
import { apiRouter, webRouter } from "./routes.js";
import { configDotenv } from "dotenv";
import db from "./db.js";
import path from "path";
import cors from "cors";
console.log("Config loaded", configDotenv());
const app = express();
app.set("view engine", "ejs");
app.set("views", path.resolve(path.join(import.meta.dirname, "templates")));
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/static/", express.static(path.resolve(path.join(import.meta.dirname, "dist", "static"))));
app.use("/bootstrap", express.static(path.join(import.meta.dirname, "..", "node_modules", "bootstrap", "dist")));
app.use("/api/v1", apiRouter);
app.use("/", webRouter);
app.get("/", (req, res) => {
    res.sendFile(path.resolve(import.meta.dirname, path.join("templates", "index.html")));
});
const HOST = process.env.HOST || "localhost";
const PORT = parseInt(process.env.PORT || "3000") || 3000;
app.listen(PORT, HOST, () => {
    db.query("SELECT NOW()"); // проверка подключения к базе
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
//# sourceMappingURL=server.js.map