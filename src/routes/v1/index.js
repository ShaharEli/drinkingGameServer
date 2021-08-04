const { Router } = require("express");
const checkToken = require("../../middelwares/checkToken");
const authRouter = require("./auth");
const friendsRouter = require("./friends");
const router = Router();

router.use("/auth", authRouter);
router.use("/friends", friendsRouter);

router.use(checkToken);

module.exports = router;
