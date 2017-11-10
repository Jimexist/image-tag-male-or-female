const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const _ = require("lodash");
const winston = require("winston");
const format = winston.format;

const myFormat = format.printf(info => {
  return `${info.timestamp} [${info.level}] : ${info.message}`;
});

const logger = winston.createLogger({
  level: "info",
  format: format.combine(format.splat(), format.timestamp(), myFormat),
  transports: [new winston.transports.Console()]
});

const pgp = require("pg-promise")({
  connect(client, db, isFresh) {
    const cp = client.connectionParameters;
    logger.info(
      "successfully connected to postgres: %s:%d/%s",
      cp.host,
      cp.port,
      cp.database
    );
  },
  disconnect(client, dc) {
    const cp = client.connectionParameters;
    logger.info("disconnecting from database: %s", cp);
  },
  error(err, e) {
    logger.warn("got error %s, %s", err, e);
  }
});

function createDatabase() {
  const username = process.env.PG_USER || "postgres";
  const password = process.env.PG_PASS || "";
  const cred = password === "" ? username : username + ":" + password;
  const hostname = process.env.PG_HOST || "localhost";
  const port = process.env.PG_PORT || 5432;
  const databaseName = process.env.PG_DBNAME || "postgres";
  const connStr = `postgres://${cred}@${hostname}:${port}/${databaseName}`;
  logger.info("connecting to postgres at: %s", connStr);
  const db = pgp(connStr);
  db
    .connect()
    .then(sco =>
      sco.any(
        `
create table if not exists image_tags(
  tag_id serial not null primary key,
  created_at timestamptz not null default now(),
  identity text not null,
  gender text not null check(gender in ('male', 'female')),
  url1 text not null,
  url2 text not null
);
      `
      )
    )
    .then(data => logger.info("tables created: %s", data))
    .catch(err => logger.warn(err));
  return db;
}

const db = createDatabase();

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

app.get("/", (req, res) => {
  res.render("index", {
    title: "男还是女",
    identity: "123",
    img_urls: ["./1", "./2"]
  });
});

app.post("/tag", (req, res) => {
  const { identity, gender, url1, url2 } = req.body;
  if (
    _.isEmpty(identity) ||
    _.isEmpty(gender) ||
    _.isEmpty(url1) ||
    _.isEmpty(url2)
  ) {
    res.status(400).send("there are some fields that were empty!");
  }
  res.redirect("/");
});

const port = process.env.PORT || 3000;

process.on("SIGINT", () => {
  logger.warn("process interrupted, exiting...");
  process.exit();
});

app.listen(port, "0.0.0.0", () => {
  logger.info("app listening at: %s", port);
});
