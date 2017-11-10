const { createDatabase } = require("./db");
const { logger } = require("./log");
const moment = require("moment");
const { loadImages } = require("./image");
const _ = require("lodash");

let sco;
const db = createDatabase();

db.connect().then(obj => {
  sco = obj;
});

async function tag(req, res) {
  const { identity, gender, url1, url2 } = req.body;
  if (
    _.isEmpty(identity) ||
    _.isEmpty(gender) ||
    _.isEmpty(url1) ||
    _.isEmpty(url2)
  ) {
    res.status(400).send("there are some fields that were empty!");
  }
  const tag_id = await sco.one(
    "insert into image_tags (identity, gender, url1, url2) values ($1, $2, $3, $4) returning tag_id;",
    [identity, gender, url1, url2]
  );
  logger.info("tag id %s", tag_id);
  res.redirect("/");
}

async function home(req, res) {
  const rows = await sco.manyOrNone(
    "select name from identities order by random() limit 1;",
    []
  );
  const identity = _(rows)
    .map(row => row.name)
    .first();

  const name = _(identity)
    .split("_")
    .join(" ");

  const images = await loadImages(identity);
  const urls = _(images)
    .map(filename => `/images/${identity}/${filename}`)
    .shuffle()
    .take(2)
    .value();

  res.render("index", {
    title: `${name} 是男还是女？`,
    identity,
    datetime: moment().format("h:mm:ss a"),
    img_urls: urls
  });
}

async function stats(req, res) {
  const rows = await sco.manyOrNone(
    `select
    i.name as name,
    count(t.gender) filter (where gender = 'male') as male_counts,
    count(t.gender) filter (where gender = 'female') as female_counts
    from identities as i left outer join image_tags as t on i.name = t.identity
    group by i.name
    order by i.name asc`,
    []
  );
  res.json(rows);
}

module.exports = {
  tag,
  home,
  stats
};
