const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const { friendsFields } = require("../utils/consts.util");
const createError = require("../utils/createError.util");
const FRIENDS_LIMIT = 30;

const searchFriends = async (req, res) => {
  const { friendUserName } = req.body;
  if (!friendUserName) createError("friendUserName field missing", 400);
  const possibleMatches = await User.find({
    $and: [
      { userName: { $regex: `^${friendUserName}`, $options: "i" } },
      { userName: { $nin: [req.userName] } },
    ],
  })
    .select(friendsFields)
    .limit(FRIENDS_LIMIT);
  res.json({ possibleMatches });
};
module.exports = {
  searchFriends,
};
