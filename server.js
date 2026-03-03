const express = require("express");
const {
  startMCQ,
  isMCQActive,
  setVideoStatus,
  getVideoStatus
} = require("./redisService");
const { asyncHandler } = require("./utils");
const { rateLimiter } = require("./middleware");

const app = express();
app.use(express.json());

/* =============================
   LOGIN (Rate Limited via Middleware)
============================= */

app.post(
  "/login",
  rateLimiter(5, 60),
  asyncHandler(async (req, res) => {
    res.json({ message: "Login allowed" });
  })
);

/* =============================
   MCQ START
============================= */
app.post(
  "/start-mcq",
  asyncHandler(async (req, res) => {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      throw new Error("userId and courseId required");
    }

    const result = await startMCQ(userId, courseId);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({ message: "MCQ started" });
  })
);

/* =============================
   MCQ SUBMIT
============================= */

app.post("/submit-mcq", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "userId and courseId required" });
    }

    const active = await isMCQActive(userId, courseId);

    if (!active) {
      return res.status(400).json({ message: "Time expired" });
    }

    res.json({ message: "Submission accepted" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* =============================
   VIDEO UPLOAD (Simulated Pipeline)
============================= */

const videoQueue = require("./videoQueue");

app.post(
  "/upload-video",
  asyncHandler(async (req, res) => {
    const { submissionId } = req.body;

    if (!submissionId) {
      throw new Error("submissionId required");
    }

    await videoQueue.add("process-video", { submissionId });

    res.json({ message: "Video job added to queue" });
  })
);

/* =============================
   VIDEO STATUS
============================= */

app.get("/video-status/:id", async (req, res) => {
  try {
    const status = await getVideoStatus(req.params.id);
    res.json({ status: status || "not_found" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* =============================
   ADMIN ROUTES
============================= */

app.post("/admin/approve/:id", async (req, res) => {
  try {
    await setVideoStatus(req.params.id, "approved");
    res.json({ message: "Video approved by admin" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/admin/reject/:id", async (req, res) => {
  try {
    await setVideoStatus(req.params.id, "rejected");
    res.json({ message: "Video rejected by admin" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

/* =============================
   START SERVER
============================= */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(500).json({
    message: "Something went wrong",
    error: err.message
  });
});



app.listen(5000, () => {
  console.log("Server running on port 5000");
});