const { logger } = require("./log");
const _ = require("lodash");
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

function createTables(sco) {
  return sco.none(`
  create table if not exists image_tags(
    tag_id serial not null primary key,
    created_at timestamptz not null default now(),
    identity text not null,
    gender text not null check(gender in ('male', 'female')),
    url1 text not null,
    url2 text not null
  );

  create table if not exists identities(
    name text not null primary key
  );`);
}

function initDB(identities, db) {
  db
    .connect()
    .then(sco => {
      let promises = [
        sco.none(`
        create table if not exists identities(
          name text not null primary key
        );`),
        sco.none(`
        create table if not exists image_tags(
          tag_id serial not null primary key,
          created_at timestamptz not null default now(),
          identity text not null references identities(name) on delete cascade,
          gender text not null check(gender in ('male', 'female')),
          url1 text not null,
          url2 text not null
        );`)
      ];
      promised = _.concat(
        promises,
        identities.map(identity =>
          sco.none(
            "insert into identities (name) values ($1) on conflict (name) do nothing",
            [identity]
          )
        )
      );
      return Promise.all(promises);
    })
    .then(data => {
      logger.info("database initialized", data);
    })
    .catch(err => logger.warn(err));
}

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
  loadIdentites().then(identities => initDB(identities, db));
  return db;
}

module.exports = {
  createDatabase
};
