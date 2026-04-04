const { Pincode, STATE_FIELD } = require("../models/Pincode");
const { streamCSV } = require("../utils/csvExport");

// ===============================
// Utility: Regex Helpers
// ===============================
const partialRegex = (str) => {
  if (!str) return null;
  const escaped = str.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(escaped, "i");
};

// ===============================
// 1. Get All States
// ===============================
const getStates = async (req, res, next) => {
  try {
    const rawStates = await Pincode.distinct(STATE_FIELD);
    const states = [
      ...new Set(rawStates.filter(Boolean).map((s) => s.trim())),
    ].sort();
    res.json(states);
  } catch (err) {
    next(err);
  }
};

// ===============================
// 2. Get Districts by State
// ===============================
const getDistrictsByState = async (req, res, next) => {
  try {
    const state = req.params.state;
    const rawDistricts = await Pincode.distinct("districtName", {
      [STATE_FIELD]: new RegExp(`^${state.trim()}\\s*$`, "i"),
    });
    const districts = [
      ...new Set(rawDistricts.filter(Boolean).map((d) => d.trim())),
    ].sort();
    res.json(districts);
  } catch (err) {
    next(err);
  }
};

// ===============================
// 3. Get Taluks by District
// ===============================
const getTaluksByDistrict = async (req, res, next) => {
  try {
    const { state, district } = req.params;
    const rawTaluks = await Pincode.distinct("taluk", {
      [STATE_FIELD]: new RegExp(`^${state.trim()}\\s*$`, "i"),
      districtName: new RegExp(`^${district.trim()}$`, "i"),
    });
    const taluks = [
      ...new Set(rawTaluks.filter(Boolean).map((t) => t.trim())),
    ].sort();
    res.json(taluks);
  } catch (err) {
    next(err);
  }
};

// ===============================
// 4. Get Filtered PIN Code Data (Paginated)
// ===============================
const getPincodes = async (req, res, next) => {
  try {
    const { state, district, taluk, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (state) filter[STATE_FIELD] = new RegExp(`^${state.trim()}\\s*$`, "i");
    if (district)
      filter.districtName = new RegExp(`^${district.trim()}$`, "i");
    if (taluk) filter.taluk = new RegExp(`^${taluk.trim()}$`, "i");

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const data = await Pincode.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    const total = await Pincode.countDocuments(filter);

    res.json({
      data: data.map((item) => ({
        ...item,
        stateName: item[STATE_FIELD]?.trim(),
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
};

// ===============================
// 5. Search API
// ===============================
const searchPincodes = async (req, res, next) => {
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
          { [STATE_FIELD]: regex },
        ],
      };
    }

    const data = await Pincode.find(filter).limit(20).lean();
    res.json(
      data.map((item) => ({ ...item, stateName: item[STATE_FIELD]?.trim() }))
    );
  } catch (err) {
    next(err);
  }
};

// ===============================
// 6. Get Details by PIN Code
// ===============================
const getPincodeDetails = async (req, res, next) => {
  try {
    const pincode = Number(req.params.pincode);
    if (isNaN(pincode))
      return res.status(400).json({ message: "Invalid pincode" });

    const data = await Pincode.find({ pincode }).lean();
    if (!data || data.length === 0)
      return res.status(404).json({ message: "Pincode not found" });

    res.json(
      data.map((item) => ({ ...item, stateName: item[STATE_FIELD]?.trim() }))
    );
  } catch (err) {
    next(err);
  }
};

// ===============================
// 7. Dashboard Stats API
// ===============================
const getStats = async (req, res, next) => {
  try {
    const totalPincodes = await Pincode.countDocuments();
    const rawStates = await Pincode.distinct(STATE_FIELD);
    const totalStates = [
      ...new Set(rawStates.filter(Boolean).map((s) => s.trim())),
    ].length;

    const deliveryStatusCounts = await Pincode.aggregate([
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]);

    const stats = {
      totalPincodes,
      totalStates,
      deliveryOffices:
        deliveryStatusCounts.find(
          (d) => d._id?.trim().toUpperCase() === "DELIVERY"
        )?.count || 0,
      nonDeliveryOffices:
        deliveryStatusCounts.find(
          (d) => d._id?.trim().toUpperCase() === "NON-DELIVERY"
        )?.count || 0,
    };

    res.json(stats);
  } catch (err) {
    next(err);
  }
};

// ===============================
// 8. State-wise Distribution
// ===============================
const getStateDistribution = async (req, res, next) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: `$${STATE_FIELD}`, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(
      distribution.map((d) => ({
        state: d._id?.trim() || "UNKNOWN",
        count: d.count,
      }))
    );
  } catch (err) {
    next(err);
  }
};

// ===============================
// 9. Delivery Status Distribution
// ===============================
const getDeliveryDistribution = async (req, res, next) => {
  try {
    const distribution = await Pincode.aggregate([
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]);

    const result = {
      delivery:
        distribution.find((d) => d._id?.trim().toUpperCase() === "DELIVERY")
          ?.count || 0,
      nonDelivery:
        distribution.find(
          (d) => d._id?.trim().toUpperCase() === "NON-DELIVERY"
        )?.count || 0,
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// ===============================
// 10. Export API (CSV Stream)
// ===============================
const exportPincodes = async (req, res, next) => {
  try {
    const { state } = req.query;
    const filter = {};
    if (state) filter[STATE_FIELD] = new RegExp(`^${state.trim()}\\s*$`, "i");

    const cursor = Pincode.find(filter).cursor();
    const filename = `pincodes_${state || "all"}.csv`;
    const { transformer } = streamCSV(res, cursor, filename);

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      const cleanDoc = doc.toObject();
      cleanDoc[STATE_FIELD] = cleanDoc[STATE_FIELD]?.trim();
      transformer.write(cleanDoc);
    }
    transformer.end();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    }
  }
};

// ===============================
// Backward Compatibility: Get States (legacy)
// ===============================
const getLegacyStates = async (req, res, next) => {
  try {
    const rawStates = await Pincode.distinct(STATE_FIELD);
    res.json(
      [...new Set(rawStates.filter(Boolean).map((s) => s.trim()))].sort()
    );
  } catch (err) {
    next(err);
  }
};

// ===============================
// Backward Compatibility: Get Districts by State (legacy)
// ===============================
const getLegacyDistrictsByState = async (req, res, next) => {
  try {
    const state = req.params.state_name;
    const rawDistricts = await Pincode.distinct("districtName", {
      [STATE_FIELD]: new RegExp(`^${state.trim()}\\s*$`, "i"),
    });
    res.json(
      [...new Set(rawDistricts.filter(Boolean).map((d) => d.trim()))].sort()
    );
  } catch (err) {
    next(err);
  }
};

// ===============================
// Backward Compatibility: Get Pincodes by District (legacy)
// ===============================
const getLegacyPincodesByDistrict = async (req, res, next) => {
  try {
    const district = req.params.district_name.trim();
    const data = await Pincode.find(
      { districtName: new RegExp(`^${district}$`, "i") },
      { officeName: 1, pincode: 1, officeType: 1, taluk: 1, _id: 0 }
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

module.exports = {
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
};
