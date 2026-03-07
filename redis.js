// const Redis = require("ioredis");

// const redis = new Redis({
//   host: "redis-17731.crce179.ap-south-1-1.ec2.cloud.redislabs.com",
//   port: 17731,
//   username: "default",
//   password: "dF4cB4tyiVoti0RQDsBiXKa3JPc0QnVa"
// });

// module.exports = redis;

const IORedis = require("ioredis");

const redis = new IORedis({
  host: "redis-17731.crce179.ap-south-1-1.ec2.cloud.redislabs.com",
  port: 17731,
  username: "default",
  password: "dF4cB4tyiVoti0RQDsBiXKa3JPc0QnVa",

  maxRetriesPerRequest: null
});

module.exports = redis;