const express = require("express");
const router = express.Router();

router.use("/", require("./create-chat-thread"));
// router.use('/', require('./service2'));

module.exports = router;
