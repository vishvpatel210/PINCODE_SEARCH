const { stringify } = require("csv-stringify");
const { STATE_FIELD } = require("../models/Pincode");

/**
 * Streams Pincode documents as CSV to the response.
 * @param {import("express").Response} res - Express response object
 * @param {import("mongoose").QueryCursor} cursor - Mongoose query cursor
 * @param {string} filename - Name for the downloaded CSV file
 */
const streamCSV = (res, cursor, filename) => {
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  const transformer = stringify({
    header: true,
    columns: [
      { key: "officeName", header: "Office Name" },
      { key: "pincode", header: "Pincode" },
      { key: "officeType", header: "Office Type" },
      { key: "deliveryStatus", header: "Delivery Status" },
      { key: "taluk", header: "Taluk" },
      { key: "districtName", header: "District" },
      { key: STATE_FIELD, header: "State" },
    ],
  });

  transformer.pipe(res);

  return { transformer };
};

module.exports = { streamCSV };
