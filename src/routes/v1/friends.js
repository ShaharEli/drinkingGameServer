const { Router } = require("express");
const withTryCatch = require("../../utils/withTryCatch.util");
const { searchFriends } = require("../../controllers/friends");

require("dotenv").config();
const rateLimit = require("express-rate-limit");
const checkToken = require("../../middelwares/checkToken");

const apiLimiter = rateLimit({
  windowMs: 30 * 1000, // 15 minutes
  max: 10,
});

const friendsRouter = Router();
friendsRouter.post("/search", (req, res) =>
  withTryCatch(req, res, searchFriends)
);

module.exports = friendsRouter;
