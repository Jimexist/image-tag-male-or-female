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

module.exports = {
  logger
};
