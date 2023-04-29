const express = require("express");
const router = express.Router();

// For the purpose of this sample, we opted to use an in-memory data store.
// This means that if the web application is restarted any information maintained would be wiped.
// For longer term storage solutions we suggest referring to this document -> https://docs.microsoft.com/en-us/azure/architecture/guide/technology-choices/data-store-decision-tree
const userIdToUserConfigMap = new Map();

/**
 * route: /azure/chatUserConfig/[userId]
 *
 * purpose: To register the user with the emoji to the thread.
 *
 * @param threadId: id of the thread to which user needs to be registered
 * @param userId: id of the user
 * @param emoji: emoji selected by the user
 *
 * @remarks
 * post call is used for registering the user to the thread and update the
 * user config with the selected emoji and get call returns userconfig of
 * all registered users.
 *
 */

router.post("/chatUserConfig/:userId", async function (req, res, next) {
  const userConfig = req.body;
  userIdToUserConfigMap.set(req.params["userId"], {
    emoji: userConfig["Emoji"],
    id: req.params["threadId"],
  });

  res.sendStatus(200);
});

module.exports = router;
