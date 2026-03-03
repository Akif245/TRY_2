const redis = require("./redis");

// RATE LIMIT
async function checkRateLimit(userId) {
  const key = `rate:login:${userId}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 60);
  }

  if (count > 5) {
    return false;
  }

  return true;
}

// START MCQ
async function startMCQ(userId, courseId) {
  const attemptKey = `mcq:attempt:${userId}:${courseId}`;
  const timerKey = `mcq:timer:${userId}:${courseId}`;

  const alreadyAttempted = await redis.get(attemptKey);
  if (alreadyAttempted) {
    return { success: false, message: "Already attempted" };
  }

  await redis.set(timerKey, "active", "EX", 60); // 1 min for testing
  await redis.set(attemptKey, "locked");

  return { success: true };
}

// CHECK MCQ TIMER
async function isMCQActive(userId, courseId) {
  const timerKey = `mcq:timer:${userId}:${courseId}`;
  const exists = await redis.get(timerKey);

  return exists ? true : false;
}

// VIDEO STATUS
async function setVideoStatus(submissionId, status) {
  await redis.set(`video:status:${submissionId}`, status);
}

async function getVideoStatus(submissionId) {
  return await redis.get(`video:status:${submissionId}`);
}

module.exports = {
  checkRateLimit,
  startMCQ,
  isMCQActive,
  setVideoStatus,
  getVideoStatus
};