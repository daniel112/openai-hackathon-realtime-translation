const express = require("express");
const router = express.Router();

router.use("/", require("./create-chat-thread"));
router.use("/", require("./get-communication-url"));
router.use("/", require("./get-communication-token"));
router.use("/", require("./add-user-to-chat-thread"));
router.use("/", require("./chat-user-config"));

module.exports = router;
