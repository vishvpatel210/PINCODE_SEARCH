require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { stringify } = require("csv-stringify");

const app = express();
app.use(cors());
app.use(express.json());

// ===============================
// ✅ MongoDB Connection
// ===============================
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vishv_vp:Vishv0210@cluster0.ikmsfsj.mongodb.net/PinCode?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// ===============================
// ✅ Database Field Helpers
// ===============================
// The DB has some fields with trailing spaces (e.g. stateName is 48 chars long)
const STATE_FIELD = "stateName".padEnd(48, " ");

// =// ===============================
// ✅ Database Schema
// ===============================
const pincodeSchema = new mongoose.Schema({
  officeName: String,
  pincode: Number,
  officeType: String,
  deliveryStatus: String,
  divisionName: String,
  regionName: String,
  circleName: String,
  taluk: String,
  districtName: String,
  [STATE_FIELD]: String,
}, { strict: false });

const Pincode = mongoose.model("PinCodes", pincodeSchema, "PinCodes");

// ===============================
// ✅ Utility: Safe Regex
// ===============================
const safeRegex = (str) => {
  if (!str) return null;
  const escaped = str.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, "i");
};

const partialRegex = (str) => {
  if (!str) return null;
  const escaped = str.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, "i");
};

// ===============================
// ✅ 1. Get All States
// ===============================
app.get("/api/states", async (req, res) => {
  try {
    const rawStates = await Pincode.distinct(STATE_FIELD);
    const states = [...new Set(rawStates.filter(Boolean).map(s => s.trim()))].sort();
    res.json(states);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 2. Get Districts by State
// ===============================
app.get("/api/states/:state/districts", async (req, res) => {
  try {
    const state = req.params.state;
    const rawDistricts = await Pincode.distinct("districtName", {
      [STATE_FIELD]: new RegExp(`^${state.trim()}\\s*$`, "i"),
    });
    const districts = [...new Set(rawDistricts.filter(Boolean).map(d => d.trim()))].sort();
    res.json(districts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 3. Get Taluks by District
// ===============================
app.get("/api/states/:state/districts/:district/taluks", async (req, res) => {
  try {
    const { state, district } = req.params;
    const rawTaluks = await Pincode.distinct("taluk", {
      [STATE_FIELD]: new RegExp(`^${state.trim()}\\s*$`, "i"),
      districtName: new RegExp(`^${district.trim()}$`, "i"),
    });
    const taluks = [...new Set(rawTaluks.filter(Boolean).map(t => t.trim()))].sort();
    res.json(taluks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 4. Get Filtered PIN Code Data (Paginated)
// ===============================
app.get("/api/pincodes", async (req, res) => {
  try {
    const { state, district, taluk, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (state) filter[STATE_FIELD] = new RegExp(`^${state.trim()}\\s*$`, "i");
    if (district) filter.districtName = new RegExp(`^${district.trim()}$`, "i");
    if (taluk) filter.taluk = new RegExp(`^${taluk.trim()}$`, "i");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await Pincode.find(filter).skip(skip).limit(parseInt(limit)).lean();
    const total = await Pincode.countDocuments(filter);

    res.json({
      data: data.map(item => ({ ...item, stateName: item[STATE_FIELD]?.trim() })),
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 5. Search API
// ===============================
app.get("/api/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const regex = partialRegex(q);
    const isNumeric = /^\d+$/.test(q);

    let filter;
    if (isNumeric) {
      filter = { pincode: parseInt(q) };
    } else {
      filter = {
        $or: [
          { officeName: regex },
          { districtName: regex },
          { [STATE_FIELD]: regex }
        ]
      };
    }

    const data = await Pincode.find(filter).limit(20).lean();
    res.json(data.map(item => ({ ...item, stateName: item[STATE_FIELD]?.trim() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 6. Get Details by PIN Code
// ===============================
app.get("/api/pincode/:pincode", async (req, res) => {
  try {
    const pincode = Number(req.params.pincode);
    if (isNaN(pincode)) return res.status(400).json({ message: "Invalid pincode" });

    const data = await Pincode.find({ pincode }).lean();
    if (!data || data.length === 0) return res.status(404).json({ message: "Pincode not found" });

    res.json(data.map(item => ({ ...item, stateName: item[STATE_FIELD]?.trim() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 7. Dashboard Stats API
// ===============================
app.get("/api/stats", async (req, res) => {
  try {
    const totalPincodes = await Pincode.countDocuments();
    const rawStates = await Pincode.distinct(STATE_FIELD);
    const totalStates = [...new Set(rawStates.filter(Boolean).map(s => s.trim()))].length;

    const deliveryStatusCounts = await Pincode.aggregate([
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } }
    ]);

    const stats = {
      totalPincodes,
      totalStates,
      deliveryOffices: deliveryStatusCounts.find(d => d._id?.trim().toUpperCase() === "DELIVERY")?.count || 0,
      nonDeliveryOffices: deliveryStatusCounts.find(d => d._id?.trim().toUpperCase() === "NON-DELIVERY")?.count || 0
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 8. State-wise Distribution
// ===============================
app.get("/api/stats/state-distribution", async (req, res) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: `$${STATE_FIELD}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(distribution.map(d => ({
      state: d._id?.trim() || "UNKNOWN",
      count: d.count
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 9. Delivery Status Distribution
// ===============================
app.get("/api/stats/delivery-distribution", async (req, res) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } }
    ]);

    const result = {
      delivery: distribution.find(d => d._id?.trim().toUpperCase() === "DELIVERY")?.count || 0,
      nonDelivery: distribution.find(d => d._id?.trim().toUpperCase() === "NON-DELIVERY")?.count || 0
    };

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// ✅ 10. Export API (CSV Stream)
// ===============================
app.get("/api/export", async (req, res) => {
  try {
    const { state } = req.query;
    const filter = {};
    if (state) filter[STATE_FIELD] = new RegExp(`^${state.trim()}\\s*$`, "i");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=pincodes_${state || "all"}.csv`);

    const cursor = Pincode.find(filter).cursor();
    const transformer = stringify({
      header: true,
      columns: [
        { key: "officeName", header: "Office Name" },
        { key: "pincode", header: "Pincode" },
        { key: "officeType", header: "Office Type" },
        { key: "deliveryStatus", header: "Delivery Status" },
        { key: "taluk", header: "Taluk" },
        { key: "districtName", header: "District" },
        { key: STATE_FIELD, header: "State" }
      ]
    });

    transformer.pipe(res);

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const cleanDoc = doc.toObject();
      cleanDoc[STATE_FIELD] = cleanDoc[STATE_FIELD]?.trim();
      transformer.write(cleanDoc);
    }
    transformer.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// ===============================
// ✅ Backward Compatibility Routes
// ===============================
app.get("/states", async (req, res) => {
  const rawStates = await Pincode.distinct(STATE_FIELD);
  res.json([...new Set(rawStates.filter(Boolean).map(s => s.trim()))].sort());
});

app.get("/states/:state_name", async (req, res) => {
  const state = req.params.state_name;
  const rawDistricts = await Pincode.distinct("districtName", {
    [STATE_FIELD]: new RegExp(`^${state.trim()}\\s*$`, "i"),
  });
  res.json([...new Set(rawDistricts.filter(Boolean).map(d => d.trim()))].sort());
});

app.get("/district/:district_name", async (req, res) => {
  const district = req.params.district_name.trim();
  const data = await Pincode.find(
    { districtName: new RegExp(`^${district}$`, "i") },
    { officeName: 1, pincode: 1, officeType: 1, taluk: 1, _id: 0 }
  );
  res.json(data);
});

// ===============================
// ✅ Default route
// ===============================
app.get("/", (req, res) => {
  res.send("🚀 Production-ready Pincode API is running...");
});

// ===============================
// ✅ Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});