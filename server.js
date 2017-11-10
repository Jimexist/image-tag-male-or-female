const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const handlers = require("./handlers");
const _ = require("lodash");
const { logger } = require("./log");

const app = express();

app.set("view engine", "pug");

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(
  "/lib/mousetrap.js",
  express.static(
    path.join(__dirname, "node_modules", "mousetrap", "mousetrap.js")
  )
);

app.use(bodyParser.urlencoded({ extended: false }));

const imageRoot = process.env.IMAGE_ROOT || path.join(__dirname, "images");

logger.info("using image root: %s", imageRoot);

app.get("/", handlers.home);

app.post("/tag", handlers.tag);

const port = process.env.PORT || 3000;

process.on("SIGINT", () => {
  logger.warn("process interrupted, exiting...");
  process.exit();
});

app.listen(port, "0.0.0.0", () => {
  logger.info("app listening at: %s", port);
});
