const { nanoid } = require("nanoid");
const User = require("../db/schemas/user");

const getUserName = ({ firstName, lastName }) =>
  `${firstName}_${lastName}_` + nanoid(4);

const generateUserName = async ({ firstName, lastName }) => {
  let userName = getUserName({ firstName, lastName });
  while (await User.findOne({ userName })) {
    userName = getUserName({ firstName, lastName });
  }
  return userName;
};

module.exports = {
  generateUserName,
};
