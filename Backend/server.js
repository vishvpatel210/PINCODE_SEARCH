const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// ✅ MongoDB Connection
// ===============================
mongoose
  .connect(
    "mongodb+srv://vishv_vp:Vishv0210@cluster0.ikmsfsj.mongodb.net/PinCode?retryWrites=true&w=majority"
  )
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));


// ===============================
// ✅ Full Schema (matches DB fields)
// ===============================
const pincodeSchema = new mongoose.Schema({
  officeName:     String,
  pincode:        Number,
  officeType:     String,
  deliveryStatus: String,
  divisionName:   String,
  regionName:     String,
  circleName:     String,
  taluk:          String,
  districtName:   String,
  ["stateName".padEnd(48, " ")]: String,
}, { strict: false });

const Pincode = mongoose.model("PinCodes", pincodeSchema, "PinCodes");


// ===============================
// ✅ 1. Get data by pincode  ← FIRST ROUTE
// ===============================
app.get("/api/:pincode", async (req, res) => {
  try {
    const pincode = Number(req.params.pincode);

    if (isNaN(pincode)) {
      return res.status(400).json({ message: "Invalid pincode format" });
    }

    const data = await Pincode.find({ pincode });

    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for this pincode" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ✅ 2. Get all states
// ===============================
app.get("/states", async (req, res) => {
  try {
    const rawStates = await Pincode.distinct("stateName".padEnd(48, " "));
    const states = [...new Set(rawStates.filter(Boolean).map(s => s.trim()))];
    states.sort();
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ✅ 3. Get distinct districts by state
// ===============================
app.get("/states/:state_name", async (req, res) => {
  try {
    const state = req.params.state_name.toUpperCase().trim();

    const rawDistricts = await Pincode.distinct("districtName", {
      ["stateName".padEnd(48, " ")]: new RegExp(`^${state}\\s*$`, "i"),
    });

    if (rawDistricts.length === 0) {
      return res.status(404).json({ message: "No districts found for this state" });
    }

    const districts = [...new Set(rawDistricts.filter(Boolean).map(d => d.trim()))];
    districts.sort();
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ✅ 4. Get pincodes by district name
// ===============================
app.get("/district/:district_name", async (req, res) => {
  try {
    const district = req.params.district_name.trim();
    // Escape special regex characters to prevent errors and unwanted behavior
    const safeDistrict = district.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const data = await Pincode.find(
      { districtName: { $regex: new RegExp(safeDistrict, "i") } }, // case-insensitive
      { officeName: 1, pincode: 1, officeType: 1, taluk: 1, _id: 0 }
    );

    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for this district" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ✅ 5. Smart Search (autocomplete)
// ===============================
app.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (q.length < 2) {
      return res.json([]);
    }

    const safeQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(safeQ, "i");
    const isNumeric = /^\d+$/.test(q);

    let filter;
    if (isNumeric) {
      filter = { pincode: { $regex: new RegExp("^" + safeQ) } };
    } else {
      filter = { $or: [
        { officeName: regex },
        { districtName: regex },
      ]};
    }

    const data = await Pincode.find(filter, {
      officeName: 1, pincode: 1, districtName: 1, _id: 0
    }).limit(10).lean();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
// ✅ Default route
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 Pincode API is running...");
});


// ===============================
// ✅ Start Server
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});