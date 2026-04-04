const express = require("express");
const router = express.Router();
const {
  getStates,
  getDistrictsByState,
  getTaluksByDistrict,
  getPincodes,
  searchPincodes,
  getPincodeDetails,
  getStats,
  getStateDistribution,
  getDeliveryDistribution,
  exportPincodes,
  getLegacyStates,
  getLegacyDistrictsByState,
  getLegacyPincodesByDistrict,
} = require("../controllers/pincodeController");

// ===============================
// API Routes (/api/*)
// ===============================
router.get("/api/states", getStates);
router.get("/api/states/:state/districts", getDistrictsByState);
router.get("/api/states/:state/districts/:district/taluks", getTaluksByDistrict);
router.get("/api/pincodes", getPincodes);
router.get("/api/search", searchPincodes);
router.get("/api/pincode/:pincode", getPincodeDetails);
router.get("/api/stats", getStats);
router.get("/api/stats/state-distribution", getStateDistribution);
router.get("/api/stats/delivery-distribution", getDeliveryDistribution);
router.get("/api/export", exportPincodes);

// ===============================
// Backward Compatibility Routes
// ===============================
router.get("/states", getLegacyStates);
router.get("/states/:state_name", getLegacyDistrictsByState);
router.get("/district/:district_name", getLegacyPincodesByDistrict);

// ===============================
// Default Route
// ===============================
router.get("/", (req, res) => {
  res.send("🚀 Production-ready Pincode API is running...");
});

module.exports = router;
