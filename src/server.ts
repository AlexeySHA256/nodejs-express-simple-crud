import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { apiRouter, webRouter } from "./routes.js";
import { configDotenv } from "dotenv";
import path from "path";
import cors from "cors";
import middlewares from "./core/middlewares.js";
import cookieParser from "cookie-parser";

console.log("Config loaded", configDotenv());

const app: Express = express();

app.set("view engine", "ejs");
app.set("views", path.resolve(path.join(import.meta.dirname, "templates")));

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  "/static/",
  express.static(path.resolve(path.join(import.meta.dirname, "..", "dist", "static")))
);

app.use("/bootstrap", express.static(path.join(import.meta.dirname, "..", "node_modules", "bootstrap", "dist")));

app.use(middlewares.authenticate);

// connect routers

app.use("/api/v1", apiRouter);
app.use("/", webRouter);

app.get("/", (req: Request, res: Response) => {
  res.sendFile(
    path.resolve(import.meta.dirname, path.join("templates", "index.html"))
  );
});

const HOST = process.env.HOST || "localhost";
const PORT = +(process.env.PORT || "3000");

export const serverUrl = `http://${HOST}:${PORT}`

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
