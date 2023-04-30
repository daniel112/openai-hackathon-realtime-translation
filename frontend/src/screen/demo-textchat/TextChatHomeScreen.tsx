import {
  Box,
  Button,
  Center,
  Container,
  HStack,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createChatThread } from "./services/createChatThread";
import {
  CAT,
  FOX,
  KOALA,
  MONKEY,
  MOUSE,
  OCTOPUS,
  getEmojiBackgroundColor,
} from "./utils/getEmojiBackgroundColor";
import { getAZCommunicationUrl } from "./services/getAZCommunicationUrl";
import { getAZCommunicationToken } from "./services/getAZCommunicationToken";
import { sendEmojiRequest } from "./services/sendEmojiRequest";
import { addUserToChatThread } from "./services/addUserToChatThread";
import { TextChatComponent } from "./DemoTextChatComponent";
import { LanguageSelector } from "../../components/LanguageSelector";
import { getChatHistory } from "./utils/getChatHistory";
import { summarizeTranscript } from "../../services/openai";

const avatarsList = [CAT, MOUSE, KOALA, OCTOPUS, MONKEY, FOX];

/**
 * 1. User will select an avatar and enter a username
 * ref: https://github.com/Azure-Samples/communication-services-javascript-quickstarts/tree/main/add-chat
 */
export const TextChatHomeScreen = (): JSX.Element => {
  const { threadId: threadIdFromParam } = useParams();
  const [threadId, setThreadId] = React.useState<string>(
    threadIdFromParam ?? ""
  );

  // pre-chat states
  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(CAT);
  const [displayName, setDisplayName] = React.useState<string>();
  const [token, setToken] = React.useState<string>();
  const [chatIdentity, setChatIdentity] = React.useState<string>();
  const [endpointUrl, setEndpointUrl] = React.useState<string>();

  // post chat summary states
  const [summary, setSummary] = React.useState<string>();

  const navigate = useNavigate();
  const languageRef = React.useRef<{ label: string; iso: string }>({
    label: "Spanish",
    iso: "es",
  });
  useEffect(() => {
    // if we already have a threadId from param, we don't need to create a new one
    if (threadIdFromParam) {
      console.log("--> already have threadId, skipping thread creation");
      return;
    }
    console.log("--> creating chat thread----");
    const createChatThread = async () => {
      const threadId = await onCreateThread();
      if (threadId) {
        setThreadId(threadId);
        console.log({ threadId });
        navigate(`/demo-textchat/${threadId}`);
      }
    };
    createChatThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emojiBGColor = getEmojiBackgroundColor(selectedAvatar);

  return (
    <HStack>
      <VStack flex={1} h={"100%"}>
        <ChatSummary summary={summary} />
      </VStack>
      {token && chatIdentity && endpointUrl && threadId && displayName ? (
        <VStack flex={1} h={"100%"}>
          <TextChatComponent
            token={token}
            userId={chatIdentity}
            displayName={displayName}
            endpointUrl={endpointUrl}
            threadId={threadId}
            languageIso={languageRef.current.iso}
            onLeaveChat={() => {
              setToken(undefined);
              setChatIdentity(undefined);
              setEndpointUrl(undefined);
              setThreadId("");
              setDisplayName(undefined);
              navigate("/demo-textchat");
            }}
            endChatHandler={async () => {
              // gather the chat history
              // summarize through GPT
              const { stringifiedMessages, messages } = await getChatHistory({
                token,
                endpointUrl,
                threadId,
              });
              console.log(stringifiedMessages);
              const result = await summarizeTranscript(stringifiedMessages);
              setSummary(result.text);
            }}
          />
        </VStack>
      ) : (
        <Center px={8} flex={1}>
          <VStack>
            <Text>Your Profile</Text>
            <Center
              style={emojiBGColor}
              borderRadius={"50%"}
              w={"8.25rem"}
              h={"8.25rem"}
            >
              <Heading as="h1" size="4xl">
                {selectedAvatar}
              </Heading>
            </Center>
            <Text>{displayName}</Text>
            <AvatarSection
              onChange={(avatar: string) => {
                setSelectedAvatar(avatar);
              }}
            />
            <Input
              placeholder="Username"
              onChange={(ev) => setDisplayName(ev.target.value)}
            />
            <LanguageSelector
              title="Primay language:"
              defaultIndex={1}
              onChange={(newValue) => {
                if (newValue) {
                  console.log(`Translating to: ${newValue.labelString}`);
                  languageRef.current = {
                    iso: newValue.value,
                    label: newValue.labelString!,
                  };
                }
              }}
            />
            <Box flex={1} w={"100%"} pt={5}>
              <Button
                w={"100%"}
                isDisabled={!displayName}
                colorScheme="blue"
                onClick={async (): Promise<void> => {
                  const token = await getAZCommunicationToken();
                  const endpointUrl = await getAZCommunicationUrl();
                  console.log({ token, endpointUrl });
                  setToken(token.token);
                  setChatIdentity(token.identity);
                  setEndpointUrl(endpointUrl);

                  // update the user profile with selected emoji avatar
                  await sendEmojiRequest(token.identity, selectedAvatar);

                  // attempt to add this user to the chat thread
                  const result = await addUserToChatThread(
                    threadId,
                    token.identity,
                    displayName!
                  );
                  if (!result) {
                    console.log("Failed to join thread");
                  }
                }}
              >
                {threadIdFromParam ? "Join" : "Create"}
              </Button>
            </Box>
          </VStack>
        </Center>
      )}
    </HStack>
  );
};

const onCreateThread = async (): Promise<string | null> => {
  const threadId = await createChatThread();
  if (!threadId) {
    console.error(
      "Failed to create a thread, returned threadId is undefined or empty string"
    );
    return null;
  } else {
    return threadId;
  }
};

const ChatSummary = ({ summary }: any) => {
  return (
    <Stack direction={"column"} paddingTop={10}>
      <Heading size={"md"}>Transcript Summary</Heading>
      <Text>{summary}</Text>
    </Stack>
  );
};

const AvatarSection = ({ onChange }: any): JSX.Element => {
  return (
    <Container>
      <Text>Avatar</Text>
      <Stack dir="column">
        <RadioGroup defaultValue={CAT}>
          <Stack spacing={5} direction="row">
            {avatarsList.map((avatar, index) => (
              <Radio
                key={index}
                size={"lg"}
                colorScheme="green"
                value={avatar}
                onChange={() => onChange(avatar)}
              >
                {avatar}
              </Radio>
            ))}
          </Stack>
        </RadioGroup>
      </Stack>
    </Container>
  );
};
