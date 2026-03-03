const { Worker } = require("bullmq");
const redis = require("./redis");
const { setVideoStatus } = require("./redisService");

const worker = new Worker(
  "video-processing",
  async job => {
    const { submissionId } = job.data;

    await setVideoStatus(submissionId, "processing");

    await new Promise(r => setTimeout(r, 5000));
    await setVideoStatus(submissionId, "transcribed");

    await new Promise(r => setTimeout(r, 5000));
    await setVideoStatus(submissionId, "similarity_flagged");

  },
  { connection: redis.options }
);

console.log("Video worker running...");