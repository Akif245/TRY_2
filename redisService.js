// const redis = require("./redis");

// // RATE LIMIT
// async function checkRateLimit(userId) {
//   const key = `rate:login:${userId}`;
//   const count = await redis.incr(key);

//   if (count === 1) {
//     await redis.expire(key, 60);
//   }

//   if (count > 5) {
//     return false;
//   }

//   return true;
// }

// // START MCQ
// async function startMCQ(userId, courseId) {
//   const attemptKey = `mcq:attempt:${userId}:${courseId}`;
//   const timerKey = `mcq:timer:${userId}:${courseId}`;

//   const alreadyAttempted = await redis.get(attemptKey);
//   if (alreadyAttempted) {
//     return { success: false, message: "Already attempted" };
//   }

//   await redis.set(timerKey, "active", "EX", 60); // 1 min for testing
//   await redis.set(attemptKey, "locked");

//   return { success: true };
// }

// // CHECK MCQ TIMER
// async function isMCQActive(userId, courseId) {
//   const timerKey = `mcq:timer:${userId}:${courseId}`;
//   const exists = await redis.get(timerKey);

//   return exists ? true : false;
// }

// // VIDEO STATUS
// async function setVideoStatus(submissionId, status) {
//   await redis.set(`video:status:${submissionId}`, status);
// }

// async function getVideoStatus(submissionId) {
//   return await redis.get(`video:status:${submissionId}`);
// }

// module.exports = {
//   checkRateLimit,
//   startMCQ,
//   isMCQActive,
//   setVideoStatus,
//   getVideoStatus
// };

// const redis = require("./redis");

// /* =========================
//    LOGIN RATE LIMIT
// ========================= */

// async function checkLoginAttempts(userId) {
//   const key = `login:${userId}`;

//   const attempts = await redis.get(key);

//   if (attempts && attempts >= 5) {
//     return false;
//   }

//   await redis.incr(key);
//   await redis.expire(key, 60);

//   return true;
// }


// /* =========================
//    MCQ TIMER
// ========================= */

// async function startMCQ(userId, courseId) {
//   const key = `mcq:${userId}:${courseId}`;

//   await redis.set(key, "active", "EX", 900);

//   return true;
// }

// async function isMCQActive(userId, courseId) {
//   const key = `mcq:${userId}:${courseId}`;

//   const value = await redis.get(key);

//   return value !== null;
// }


// /* =========================
//    VIDEO STATUS
// ========================= */

// async function setVideoStatus(submissionId, status) {
//   const key = `video:${submissionId}`;

//   await redis.set(key, status);

//   return true;
// }

// async function getVideoStatus(submissionId) {
//   const key = `video:${submissionId}`;

//   return await redis.get(key);
// }

// module.exports = {
//   checkLoginAttempts,
//   startMCQ,
//   isMCQActive,
//   setVideoStatus,
//   getVideoStatus
// };

const redis = require("./redis");

/* =========================
   LOGIN RATE LIMIT
========================= */

async function checkLoginAttempts(userId) {
  const key = `login:${userId}`;

  const attempts = await redis.get(key);

  if (attempts && attempts >= 5) {
    return false;
  }

  await redis.incr(key);
  await redis.expire(key, 60);

  return true;
}


/* =========================
   MCQ START + ATTEMPT LOCK
========================= */

async function startMCQ(userId, courseId) {

  const key = `mcq:${userId}:${courseId}`;

  const exists = await redis.get(key);

  if (exists) {
    throw new Error("MCQ already attempted");
  }

  // store MCQ start with 15 min timer
  await redis.set(key, "active", "EX", 900);
    // await redis.set(key, "active", "EX", 30);  //to check i did it 30 seconds


  return true;
}


/* =========================
   MCQ TIMER CHECK
========================= */

async function isMCQActive(userId, courseId) {

  const key = `mcq:${userId}:${courseId}`;

  const value = await redis.get(key);

  return value !== null;

}


/* =========================
   VIDEO STATUS
========================= */

async function setVideoStatus(submissionId, status) {

  const key = `video:${submissionId}`;

  await redis.set(key, status);

  return true;

}

async function getVideoStatus(submissionId) {

  const key = `video:${submissionId}`;

  return await redis.get(key);

}


module.exports = {
  checkLoginAttempts,
  startMCQ,
  isMCQActive,
  setVideoStatus,
  getVideoStatus
};