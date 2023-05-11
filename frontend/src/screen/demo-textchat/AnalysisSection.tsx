import {
  Card,
  CardHeader,
  Heading,
  Stack,
  Divider,
  CardBody,
  Box,
  Text,
  CircularProgress,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { CustomerSentiment } from "./CustomerSentiment";
import React, { useEffect } from "react";
import { gptUse } from "../../services/openai";
import { ChatMessageItem } from "./DemoTextChatComponent";
import { TableData, mockData } from "./mockData";

interface AnalysisSectionProps {
  chatMessages: ChatMessageItem[];
  summary?: string;
  stringifiedChatHistory?: string;
}

export const AnalysisSection = (props: AnalysisSectionProps) => {
  const { chatMessages, summary, stringifiedChatHistory } = props;
  return (
    <>
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
            <Heading
              size="xs"
              fontWeight={"medium"}
              textAlign={"start"}
              lineHeight={6}
            >
              <ChatSummary summary={summary} />
              <CustomerSentiment
                stringifiedChatHistory={stringifiedChatHistory}
              />
            </Heading>
          </Box>
        </CardBody>
      </Card>
    </>
  );
};

const ChatSummary = ({ summary }: any) => {
  return (
    <Stack direction={"column"}>
      <Heading size={"sm"}>Transcript Summary</Heading>
      <Box whiteSpace="pre-wrap">{summary}</Box>
    </Stack>
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
        console.log("null removed: ", parsedObj);

        // filter for matching data in the mock DB
        // case insensitive
        if (Object.keys(parsedObj).length === 0) return;
        const filtered = mockData.filter((obj) =>
          Object.keys(parsedObj).every(
            (key) =>
              obj[key as keyof TableData]?.toLowerCase() ===
              parsedObj[key as keyof TableData]?.toLowerCase()
          )
        );
        console.log({ filtered });
        setgptParsedData(filtered);
      } catch (error) {
        console.error("Failed to parse GPT result");
        console.error(error);
        setLoading(false);
      }
    };
    asyncGpt();
  }, [messages]);

  if (!messages || messages.length === 0) return null;
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
