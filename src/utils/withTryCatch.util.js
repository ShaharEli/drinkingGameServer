const Logger = require("../logger/logger");

const withTryCatch = async (req, res, cb) => {
  try {
    await cb(req, res);
  } catch (e) {
    if (e?.customMessage) {
      return res.status(e?.status || 500).json({ error: e.customMessage });
    }
    Logger.error(e.message);
    return res.status(500).json({ error: "error occurred" });
  }
};

module.exports = withTryCatch;
