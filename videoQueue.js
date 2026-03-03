const { Queue } = require("bullmq");
const redis = require("./redis");

const videoQueue = new Queue("video-processing", {
  connection: redis.options
});

module.exports = videoQueue;