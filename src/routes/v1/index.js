const { Router } = require("express");
const checkToken = require("../../middelwares/checkToken");
const authRouter = require("./auth");
const contactsRouter = require("./contacts");
const router = Router();

router.use("/auth", authRouter);

router.use(checkToken);

router.use("/contacts", contactsRouter);

module.exports = router;
