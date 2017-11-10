const path = require("path");
const fs = require("fs");
const walk = require("walk");
const { logger } = require("./log");

function loadIdentites() {
  const imageRoot = process.env.IMAGE_ROOT || path.join(__dirname, "images");
  logger.info("using image root: %s", imageRoot);
  const walker = walk.walk(imageRoot, {
    followLinks: false
  });
}

module.exports = {
  loadIdentites
};
