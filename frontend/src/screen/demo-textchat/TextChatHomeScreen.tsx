import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  CircularProgress,
  Container,
  Divider,
  HStack,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
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
import { ChatMessageItem, TextChatComponent } from "./DemoTextChatComponent";
import { LanguageSelector } from "../../components/LanguageSelector";
import { getChatHistory } from "./utils/getChatHistory";
import { summarizeTranscript } from "../../services/openai";
import { AnalysisSection } from "./AnalysisSection";
import { UserRegistration } from "./components/UserRegistration";

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

  // realtime chat states
  const [chatMessages, setChatMessages] = React.useState<ChatMessageItem[]>([]);

  // post chat summary states
  const [stringifiedChatHistory, setStringifiedChatHistory] =
    React.useState<string>();
  const [summary, setSummary] = React.useState<string>();

  const navigate = useNavigate();
  const languageRef = React.useRef<{ label: string; iso: string }>({
    label: "Spanish",
    iso: "es",
  });

  const emojiBGColor = getEmojiBackgroundColor(selectedAvatar);

  return (
    <HStack>
      <VStack flex={1} h={"100%"}>
        <Tabs width={"100%"} align="center" isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab>Analysis</Tab>
            <Tab>Customer Chat</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <AnalysisSection
                chatMessages={chatMessages}
                summary={summary}
                stringifiedChatHistory={stringifiedChatHistory}
              />
            </TabPanel>
            <TabPanel>
              {token &&
              chatIdentity &&
              endpointUrl &&
              threadId &&
              displayName ? (
                <TextChatComponent
                  token={token}
                  userId={chatIdentity}
                  displayName={displayName}
                  endpointUrl={endpointUrl}
                  threadId={threadId}
                  languageIso={languageRef.current.iso}
                  onMessageReceived={(message: ChatMessageItem) => {
                    // 1. append to chat history
                    setChatMessages((prev) => [...prev, message]);
                  }}
                  onLeaveChat={() => {
                    setToken(undefined);
                    setChatIdentity(undefined);
                    setEndpointUrl(undefined);
                    setThreadId("");
                    setDisplayName(undefined);
                    navigate("/demo-textchat");
                  }}
                  endChatHandler={async () => {
                    console.log("End chat through the other chat");
                  }}
                />
              ) : (
                <UserRegistration threadId={threadId} />
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
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
            onMessageReceived={(message: ChatMessageItem) => {
              // 1. append to chat history
              setChatMessages((prev) => [...prev, message]);
            }}
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
              setStringifiedChatHistory(stringifiedMessages);
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
                  // create a new room if no threadId is provided in param
                  let activeThreadId = threadId;
                  if (!activeThreadId) {
                    console.log("--> creating chat thread----");
                    activeThreadId = await onCreateThread();
                    if (activeThreadId) {
                      setThreadId(activeThreadId);
                      navigate(`/demo-textchat/${activeThreadId}`);
                    }
                  }

                  // join the room
                  const token = await getAZCommunicationToken();
                  const endpointUrl = await getAZCommunicationUrl();
                  setToken(token.token);
                  setChatIdentity(token.identity);
                  setEndpointUrl(endpointUrl);

                  // update the user profile with selected emoji avatar
                  await sendEmojiRequest(token.identity, selectedAvatar);

                  // attempt to add this user to the chat thread
                  const result = await addUserToChatThread(
                    activeThreadId,
                    token.identity,
                    displayName!
                  );
                  if (!result) {
                    console.log("Failed to join thread");
                  }
                }}
              >
                {threadIdFromParam ? "Join Room" : "Create Room"}
              </Button>
            </Box>
          </VStack>
        </Center>
      )}
    </HStack>
  );
};

const onCreateThread = async (): Promise<string> => {
  const threadId = await createChatThread();
  if (!threadId) {
    console.error(
      "Failed to create a thread, returned threadId is undefined or empty string"
    );
    return "";
  } else {
    return threadId;
  }
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
