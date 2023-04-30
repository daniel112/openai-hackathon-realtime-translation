import {
  AvatarPersonaData,
  ChatAdapter,
  ChatComposite,
  fromFlatCommunicationIdentifier,
  toFlatCommunicationIdentifier,
  useAzureCommunicationChatAdapter,
} from "@azure/communication-react";
import { useCallback, useMemo, useEffect } from "react";
import { fetchEmojiForUser } from "./services/getUserEmoji";
import { getEmojiBackgroundColor } from "./utils/getEmojiBackgroundColor";
import { createAutoRefreshingCredential } from "./services/credential";
import { CommunicationUserIdentifier } from "@azure/communication-common";
import { Button, Stack } from "@chakra-ui/react";
import { ChatMessage } from "@azure/communication-chat";
import { Text } from "@chakra-ui/react";

interface ChatScreenProps {
  token: string;
  userId: string;
  displayName: string;
  endpointUrl: string;
  threadId: string;
  endChatHandler(isParticipantRemoved: boolean): void;
  onLeaveChat(): void;
}

export const TextChatComponent = (props: ChatScreenProps): JSX.Element => {
  const {
    displayName,
    endpointUrl,
    threadId,
    token,
    userId,
    endChatHandler,
    onLeaveChat,
  } = props;
  const adapterAfterCreate = useCallback(
    async (adapter: ChatAdapter): Promise<ChatAdapter> => {
      adapter.on("participantsRemoved", (listener) => {
        const removedParticipantIds = listener.participantsRemoved.map((p) =>
          toFlatCommunicationIdentifier(p.id)
        );
        if (removedParticipantIds.includes(userId)) {
          const removedBy = toFlatCommunicationIdentifier(
            listener.removedBy.id
          );
          endChatHandler(removedBy !== userId);
        }
      });
      adapter.on("messageReceived", (listener) => {
        console.log("message received", listener);
      });
      adapter.on("error", (e) => {
        console.error(e);
      });
      return adapter;
    },
    [endChatHandler, userId]
  );

  const adapterArgs = useMemo(
    () => ({
      endpoint: endpointUrl,
      userId: fromFlatCommunicationIdentifier(
        userId
      ) as CommunicationUserIdentifier,
      displayName,
      credential: createAutoRefreshingCredential(userId, token),
      threadId,
    }),

    [endpointUrl, userId, displayName, token, threadId]
  );

  const adapter = useAzureCommunicationChatAdapter(
    adapterArgs,
    adapterAfterCreate
  );

  // Dispose of the adapter in the window's before unload event
  useEffect(() => {
    const disposeAdapter = (): void => adapter?.dispose();
    window.addEventListener("beforeunload", disposeAdapter);
    return () => window.removeEventListener("beforeunload", disposeAdapter);
  }, [adapter]);

  if (adapter) {
    const onFetchAvatarPersonaData = (
      userId: any
    ): Promise<AvatarPersonaData> =>
      fetchEmojiForUser(userId).then(
        (emoji) =>
          new Promise((resolve) => {
            return resolve({
              imageInitials: emoji,
              initialsColor: getEmojiBackgroundColor(emoji)?.backgroundColor,
            });
          })
      );
    return (
      <Stack dir="column">
        <ChatComposite
          adapter={adapter}
          onRenderMessage={(props) => {
            console.log(props);
            // NOTE: microsofts js sdk suck ass
            // the typing is all wrong
            const chatMessage = props.message as unknown as ChatMessage;
            const message = chatMessage.content as string;
            return (
              <>
                <Text>{message}</Text>
              </>
            );
          }}
          // fluentTheme={currentTheme.theme}
          options={{
            autoFocus: "sendBoxTextField",
          }}
          onFetchAvatarPersonaData={onFetchAvatarPersonaData}
        />
        <Button
          onClick={() => {
            adapter.removeParticipant(userId);
            onLeaveChat();
          }}
        >
          Leave Chat
        </Button>
      </Stack>
    );
  }
  return <>Initializing...</>;
};
