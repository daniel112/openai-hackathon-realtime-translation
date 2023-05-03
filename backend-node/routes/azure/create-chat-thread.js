const express = require("express");
const router = express.Router();
const {
  ChatClient,
  CreateChatThreadOptions,
  CreateChatThreadRequest,
} = require("@azure/communication-chat");
const {
  AzureCommunicationTokenCredential,
} = require("@azure/communication-common");
const {
  getIdentityClient,
  getCommunicationEndpoint,
} = require("../../utils/azure/communication-service");
/**
 * route: /createThread/
 *
 * purpose: Create a new chat thread.
 *
 * @returns The new threadId as string
 *
 */

router.post("/createChatThread", async function (req, res, next) {
  res.send(await createThread());
});

const createThread = async (topicName) => {
  const communicationUserIdentifier = {
    communicationUserId: process.env.COMMUNICATION_USER_ID,
  };

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

  const request = {
    topic: topicName ?? "Chat Thread Insight Demo",
  };
  const options = {
    participants: [
      {
        id: {
          communicationUserId: communicationUserIdentifier.communicationUserId,
        },
      },
    ],
  };
  const result = await chatClient.createChatThread(request, options);

  const threadID = result.chatThread?.id;
  if (!threadID) {
    throw new Error(
      `Invalid or missing ID for newly created thread ${result.chatThread}`
    );
  }

  return threadID;
};

module.exports = router;
