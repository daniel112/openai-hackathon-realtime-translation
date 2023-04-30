const { ChatClient } = require("@azure/communication-chat");
const {
  AzureCommunicationTokenCredential,
} = require("@azure/communication-common");
const {
  getIdentityClient,
  getCommunicationEndpoint,
} = require("../../utils/azure/communication-service");

const express = require("express");
const router = express.Router();

router.post("/addUserToChat/:threadId", async function (req, res, next) {
  const communicationUserIdentifier = {
    communicationUserId: process.env.COMMUNICATION_USER_ID,
  };
  const addUserParam = req.body;
  const threadId = req.params["threadId"];

  // create a user from the adminUserId and create a credential around that
  const credential = new AzureCommunicationTokenCredential({
    tokenRefresher: async () =>
      (
        await getIdentityClient.getToken(communicationUserIdentifier, [
          "chat",
          "voip",
        ])
      ).token,
    refreshProactively: true,
  });

  const chatClient = new ChatClient(getCommunicationEndpoint(), credential);
  const chatThreadClient = await chatClient.getChatThreadClient(threadId);

  try {
    await chatThreadClient.addParticipants({
      participants: [
        {
          id: { communicationUserId: addUserParam.Id },
          displayName: addUserParam.DisplayName,
        },
      ],
    });
    res.sendStatus(201);
  } catch (err) {
    console.log("Error adding user to chat thread: ", err);
    // we will return a 404 if the thread to join is not accessible by the server user.
    // The server user needs to be in the thread in order to add someone.
    // So we are returning back that we can't find the thread to add the client user to.
    res.sendStatus(404);
  }
});

module.exports = router;
