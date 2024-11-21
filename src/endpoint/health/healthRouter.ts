import express from "express";

const router = express.Router();

// Define the health check route
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
  });
});

export default router;
