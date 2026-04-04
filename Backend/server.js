require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const pincodeRoutes = require("./routes/pincodeRoutes");
const errorHandler = require("./middleware/errorHandler");

// ===============================
// Initialize Express
// ===============================
const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Routes
// ===============================
app.use("/", pincodeRoutes);

// ===============================
// Error Handling (must be last)
// ===============================
app.use(errorHandler);

// ===============================
// Connect DB & Start Server
// ===============================
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🔥 Server running on http://localhost:${PORT}`);
  });
});