const { createDatabase } = require("./db");

const db = createDatabase();

function tag(req, res) {
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
}

function home(req, res) {
  res.render("index", {
    title: "男还是女",
    identity: "123",
    img_urls: ["./1", "./2"]
  });
}

module.exports = {
  tag,
  home
};
