import {
  AvatarPersonaData,
  ChatAdapter,
  ChatComposite,
  SystemMessage,
  darkTheme,
  fromFlatCommunicationIdentifier,
  toFlatCommunicationIdentifier,
  useAzureCommunicationChatAdapter,
  ChatMessage,
} from "@azure/communication-react";
import { useCallback, useMemo, useEffect } from "react";
import { fetchEmojiForUser } from "./services/getUserEmoji";
import { getEmojiBackgroundColor } from "./utils/getEmojiBackgroundColor";
import { createAutoRefreshingCredential } from "./services/credential";
import { CommunicationUserIdentifier } from "@azure/communication-common";
import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

interface ChatScreenProps {
  token: string;
  userId: string;
  displayName: string;
  endpointUrl: string;
  threadId: string;
  languageIso: string;
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
    languageIso,
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
      <>
        <HStack>
          <Button
            colorScheme="red"
            onClick={() => {
              adapter.removeParticipant(userId);
              onLeaveChat();
            }}
          >
            End Chat
          </Button>
        </HStack>
        <Box w={"100%"} flex={1} maxH={800}>
          <ChatComposite
            adapter={adapter}
            onRenderMessage={(props) => {
              /**
               * When a user join. display some system message
               */
              if (props.message.messageType === "system") {
                const systemMessage = props.message as SystemMessage;
                if (systemMessage.systemMessageType === "participantAdded") {
                  const newUserDisplayName =
                    systemMessage.participants[0].displayName;
                  return <Text>{newUserDisplayName} joined</Text>;
                }
              }
              if (props.message.messageType === "custom") {
                console.log({ custom: props });
              }
              if (props.message.messageType === "chat") {
                const chatMessage = props.message as ChatMessage;
                if (chatMessage.mine) {
                  return (
                    <Box
                      bg={"messenger.400"}
                      p={4}
                      color={"white"}
                      borderRadius={8}
                      maxW={"30%"}
                    >
                      {chatMessage.content}
                    </Box>
                  );
                } else {
                  return (
                    <Box
                      bg={"blackAlpha.300"}
                      p={4}
                      color={"white"}
                      borderRadius={8}
                      maxW={"30%"}
                    >
                      <VStack alignItems={"flex-start"}>
                        <Text color={"gray.400"}>
                          {chatMessage.senderDisplayName}
                        </Text>
                        <Text>{chatMessage.content}</Text>
                      </VStack>
                    </Box>
                  );
                }
              }
              return <div></div>;
            }}
            fluentTheme={darkTheme}
            options={{
              autoFocus: "sendBoxTextField",
            }}
            onFetchAvatarPersonaData={onFetchAvatarPersonaData}
          />
        </Box>
      </>
    );
  }
  return <>Initializing...</>;
};
