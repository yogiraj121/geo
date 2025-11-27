const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS: restrict to known frontend origin if provided
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
  })
);

// Body parser with small limit to prevent abuse
app.use(express.json({ limit: "10kb" }));

// Basic rate limiting for all API routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
});
app.use("/api", limiter);

// Routes
const userRoutes = require("./src/routes/userRoutes");
app.use("/api/users", userRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Nearby location API is running" });
});

// Global error handler (simple)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Nearby location backend listening on port ${PORT}`);
});
