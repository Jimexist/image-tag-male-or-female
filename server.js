const express = require("express");
const path = require("path");

const app = express();

app.set("view engine", "pug");

app.use("/public", express.static(path.join(__dirname, "public")));

app.use(
  "/lib/mousetrap.js",
  express.static(
    path.join(__dirname, "node_modules", "mousetrap", "mousetrap.js")
  )
);

app.get("/", (req, res) => {
  res.render("index", {
    title: "男还是女",
    identity: "123",
    img_urls: ["./1", "./2"]
  });
});

app.post("/tag", (req, res) => {
  const identity = req.query("identity");
  const gender = req.query("gender");
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
  console.info("app listening at", port);
});
