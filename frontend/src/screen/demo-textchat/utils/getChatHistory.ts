import { ChatClient } from "@azure/communication-chat";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

interface GetChatHistoryParams {
  token: string;
  endpointUrl: string;
  threadId: string;
}

export const getChatHistory = async ({
  token,
  endpointUrl,
  threadId,
}: GetChatHistoryParams) => {
  console.log("getChatHistory");
  const tokenCredential = new AzureCommunicationTokenCredential(token);
  const chatClient = new ChatClient(endpointUrl, tokenCredential);
  const threadClient = chatClient.getChatThreadClient(threadId);

  let stringifiedMessages = "";
  const messages = [];
  for await (const chatMessage of threadClient.listMessages()) {
    if (chatMessage.type === "text") {
      const obj = {
        name: chatMessage.senderDisplayName,
        content: chatMessage.content?.message,
      };
      stringifiedMessages =
        `${chatMessage.senderDisplayName}: ${chatMessage.content?.message}\n`.concat(
          stringifiedMessages
        );
      messages.push(obj);
    }
  }
  return { stringifiedMessages, messages };
};
