const bcrypt = require("bcryptjs");
const Error = require("../db/schemas/error");
const User = require("../db/schemas/user");
const Logger = require("../logger/logger");
const createError = require("../utils/createError.util");
const {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokens.util");
const { userValidationSchema } = require("../validations/user");

const logErrorToService = async (req, res) => {
  const { info, platform, user, error } = req.body;
  const payload = {
    info: JSON.stringify(error),
    platform,
    user,
    error: JSON.stringify(error),
  };
  if (!user) delete payload.user;
  if (!user && !info && !error) createError("not enough data provided", 400);
  // TODO validation
  const newError = new Error(payload);
  const savedError = await newError.save();
  res.json({ created: savedError });
};

const login = async (req, res) => {
  const { password, email } = req.body;
  if (!password || !email) createError("content missing", 400);
  const user = await User.findOne({ email });
  if (!user) createError("error occurred", 500);
  const isPassOk = bcrypt.compareSync(password, user.password);
  if (!isPassOk) createError("One of the fields incorrect", 500); //TODO better response
  delete user.password;
  const accessToken = generateAccessToken(user._id, user.userName);
  const refreshToken = await generateRefreshToken(user._id, user.userName);
  res.json({ accessToken, refreshToken, user });
};

const loginWithToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) createError("token missing", 400);
  const { userId } = verifyRefreshToken(refreshToken);
  if (!userId) createError("invalid token", 400);
  const user = await User.findById(userId).lean();
  if (!user) createError("error occurred", 500);
  delete user.password;
  const accessToken = generateAccessToken(userId, user.userName);
  res.json({ user, accessToken });
};

const editUser = async (req, res) => {
  const {
    firstName = null,
    lastName = null,
    language = null,
    avatar = null,
    userName = null,
  } = req.body;
  const payload = {
    firstName,
    lastName,
    language,
    avatar,
    userName,
  };
  Object.keys(payload).map((key) => {
    if (!payload[key]) {
      delete payload[key];
    }
  });
  if (!Object.keys(payload).length) createError("data missing", 400);
  const user = await User.findByIdAndUpdate(req.userId, payload, {
    new: true,
  }).lean();
  if (!user) createError("error occurred", 400);
  delete user.password;
  res.json({ user });
};

const verifyMail = async () => {};

const register = async (req, res) => {
  const {
    firstName,
    lastName,
    avatar = null,
    email,
    password,
    language,
  } = req.body;
  const payload = {
    firstName,
    lastName,
    avatar,
    email,
    password,
    language,
  };
  if (!avatar) delete payload.avatar;
  try {
    await userValidationSchema.validateAsync(payload);
    const isUserExists = await User.findOne({ email, isVerified: true });
    if (isUserExists) createError("error occurred", 400);
    const passwordHash = bcrypt.hashSync(payload.password, 8);
    payload.password = passwordHash;
    payload.userName = await generateUserName({ firstName, lastName });
    const newUser = new User(payload);
    const user = await newUser.save();
    const accessToken = generateAccessToken(user._id, newUser.userName);
    const refreshToken = await generateRefreshToken(user._id, newUser.userName);
    delete user.password;
    // TODO send mail
    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    Logger.error(err);
    createError("error occurred", 400);
  }
};

const checkIfUserNameIsValid = async (req, res) => {
  const { userName } = req.body;
  if (userName?.length < 6) return res.json({ ok: false });
  const isUserExists = await User.findOne({ userName });
  if (isUserExists) return res.json({ ok: false });
  return res.json({ ok: true });
};

const getToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) createError("token missing", 400);
  const { userId, userName } = verifyRefreshToken(refreshToken);
  if (!userId) createError("invalid token", 400);
  const accessToken = generateAccessToken(userId, userName);
  res.json({ accessToken });
};

module.exports = {
  login,
  verifyMail,
  register,
  getToken,
  loginWithToken,
  logErrorToService,
  editUser,
  checkIfUserNameIsValid,
};
