const { logger } = require("./log");
const { loadIdentites } = require("./image");

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
  loadIdentites();
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

module.exports = {
  createDatabase
};
