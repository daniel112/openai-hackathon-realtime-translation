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
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useEffect } from "react";
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
import { gptUse, summarizeTranscript } from "../../services/openai";
import { TableData, mockData } from "./mockData";
import { CustomerSentiment } from "./CustomerSentiment";

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
  const [stringifieldChatHistory, setStringifieldChatHistory] =
    React.useState<string>();
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
        <Card variant={"filled"} width={"100%"} maxW={700} mt={50}>
          <CardHeader>
            <Heading size="md">
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Text alignSelf={"center"}>Real-Time Analysis</Text>
              </Stack>
            </Heading>
            <Divider pt={5} />
          </CardHeader>
          <CardBody>
            <Box maxH={500} minH={200} overflowY="auto">
              <Heading size="xs" fontWeight={"medium"} lineHeight={6}>
                <UserTable messages={chatMessages} />
              </Heading>
            </Box>
          </CardBody>
        </Card>
        <Card variant={"filled"} width={"100%"} maxW={700}>
          <CardHeader>
            <Heading size="md">
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Text alignSelf={"center"}>Post Chat Analysis</Text>
              </Stack>
            </Heading>
            <Divider pt={5} />
          </CardHeader>
          <CardBody>
            <Box maxH={500} minH={200} overflowY="auto">
              <Heading size="xs" fontWeight={"medium"} lineHeight={6}>
                <ChatSummary summary={summary} />
                <CustomerSentiment
                  stringifieldChatHistory={stringifieldChatHistory}
                />
              </Heading>
            </Box>
          </CardBody>
        </Card>
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
              setStringifieldChatHistory(stringifiedMessages);
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
      {/* <Heading size={"md"}>Transcript Summary</Heading> */}
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

const UserTable = ({ messages }: { messages: ChatMessageItem[] }) => {
  const [gptParsedData, setgptParsedData] = React.useState<TableData[]>();
  const [loading, setLoading] = React.useState<boolean>(false);
  useEffect(() => {
    const asyncGpt = async () => {
      // analyze & extract data
      try {
        if (!messages || messages.length === 0) return;
        setLoading(true);
        const result = await gptUse({
          prompt: `extract any of the following insights from the conversation. \nid, name, email, phone. Always respond in a JSON stringified object. if the value is 'null' or 'undefined', leave it out of the object.\n\nConversation Transcript:\n\n${JSON.stringify(
            messages
          )}`,
          systemMessage:
            "You are a conversation insight analysis bot. Your job is to analyze the conversation data and extract insights.",
        });
        console.log("GPT result: ", result.text);
        setLoading(false);

        if (!result.text) return;
        const parsedObj = JSON.parse(result.text);
        // remove null keys
        removeNullKeys(parsedObj);
        // filter for matching data in the mock DB
        // case insensitive
        const filtered = mockData.filter((obj) =>
          Object.keys(parsedObj).every(
            (key) =>
              obj[key as keyof TableData]?.toLowerCase() ===
              parsedObj[key as keyof TableData]?.toLowerCase()
          )
        );
        setgptParsedData(filtered);
      } catch (error) {
        console.error("Failed to parse GPT result");
        console.error(error);
        setLoading(false);
      }
    };
    asyncGpt();
  }, [messages]);
  return (
    <TableContainer>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Account ID</Th>
            <Th>Name</Th>
            <Th>Email</Th>
            <Th>Phone</Th>
            <Th>Membership Type</Th>
            <Th>Pending Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <CircularProgress />
          ) : (
            gptParsedData?.map((data, index) => {
              return (
                <Tr key={index}>
                  <Td>{data.id}</Td>
                  <Td>{data.name}</Td>
                  <Td>{data.email}</Td>
                  <Td>{data.phone}</Td>
                  <Td>{data.membershipType}</Td>
                  <Td>{data.pendingBalance}</Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

function removeNullKeys(data: any): void {
  for (const key in data) {
    if (data[key] === null) {
      delete data[key];
    }
  }
}
