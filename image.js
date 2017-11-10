const path = require("path");
const fs = require("fs");
const walk = require("walk");
const _ = require("lodash");
const { logger } = require("./log");

const imageRoot = process.env.IMAGE_ROOT || path.join(__dirname, "images");

function loadImages(identity) {
  const folder = path.join(imageRoot, identity);
  const walker = walk.walk(folder, {
    followLinks: false
  });
  return new Promise((resolve, reject) => {
    let result = [];
    let errors = [];
    walker.on("files", function(root, dirStatsArray, next) {
      _(dirStatsArray)
        .filter(s => s.type === "file")
        .map(s => s.name)
        .forEach(name => result.push(name));
      next();
    });

    walker.on("errors", function(root, nodeStatsArray, next) {
      nodeStatsArray.forEach(s => errors.push(s));
      next();
    });

    walker.on("end", function() {
      if (_.isEmpty(errors)) {
        logger.info("loaded %s files: %s", result.length, _(result).join(", "));
        resolve(result);
      } else {
        reject(errors);
      }
    });
  });
}

function loadIdentites() {
  logger.info("using image root: %s", imageRoot);
  const walker = walk.walk(imageRoot, {
    followLinks: false
  });
  return new Promise((resolve, reject) => {
    let result = [];
    let errors = [];
    walker.on("directories", function(root, dirStatsArray, next) {
      _(dirStatsArray)
        .filter(s => s.type === "directory")
        .map(s => s.name)
        .forEach(name => result.push(name));
      next();
    });

    walker.on("errors", function(root, nodeStatsArray, next) {
      nodeStatsArray.forEach(s => errors.push(s));
      next();
    });

    walker.on("end", function() {
      if (_.isEmpty(errors)) {
        logger.info(
          "loaded %s identities: %s",
          result.length,
          _(result).join(", ")
        );
        resolve(result);
      } else {
        reject(errors);
      }
    });
  });
}

module.exports = {
  loadIdentites,
  loadImages,
  imageRoot
};
