const mongoose = require("mongoose");

// The DB has some fields with trailing spaces (e.g. stateName is 48 chars long)
const STATE_FIELD = "stateName".padEnd(48, " ");

const pincodeSchema = new mongoose.Schema(
  {
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
  },
  { strict: false }
);

const Pincode = mongoose.model("PinCodes", pincodeSchema, "PinCodes");

module.exports = { Pincode, STATE_FIELD };
