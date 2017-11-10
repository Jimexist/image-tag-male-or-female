const express = require("express");
const path = require("path");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const _ = require("lodash");

const pgp = require("pg-promise")({
  connect(client, db, isFresh) {
    const cp = client.connectionParameters;
    console.info("successfully connected to postgres:", cp);
  },
  disconnect(client, dc) {
    const cp = client.connectionParameters;
    console.info("disconnecting from database:", cp);
  },
  error(err, e) {
    console.warn("got error", err, e);
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
  console.info("connecting to postgres at", connStr);
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
    .then(data => console.info("tables created", data))
    .catch(err => console.warn(err));
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

app.listen(port, "0.0.0.0", () => {
  console.info("app listening at", port);
});
