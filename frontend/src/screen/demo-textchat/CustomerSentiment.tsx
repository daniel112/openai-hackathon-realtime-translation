import React, { useEffect } from "react";
import { gptUse } from "../../services/openai";
import { Box, Heading, Stack, Text } from "@chakra-ui/react";

const prompt =
  "Extract the sentiment for each unique user. Classify them as one or more of: 1. Satisfied: The customer is happy with the service or product and had a positive experience with the call center representative.\n\n2. Neutral: The customer's issue may have been resolved, but they did not express strong positive or negative emotions about their experience.\n\n3. Dissatisfied: The customer is unhappy with the service or product and may have had a negative experience with the call center representative.\n\n4. Frustrated: The customer is experiencing ongoing issues and may feel that their concerns are not being adequately addressed by the call center.\n\n5. Angry: The customer is extremely upset with the service or product and may have had a heated interaction with the call center representative.\n\n6. Confused: The customer may be unsure about the information provided or have difficulty understanding the instructions given by the call center representative.\n\n7. Appreciative: The customer expresses gratitude for the assistance provided by the call center and may compliment the representative's professionalism or helpfulness.\n\n8. Anxious: The customer may be worried about their issue and may express concern or urgency about getting it resolved.\n\n9. Impatient: The customer may be in a hurry or feel that their issue is not being resolved quickly enough, leading to frustration with the call center process.\n\n10. Relieved: The customer may have had a difficult issue resolved, and they express relief and gratitude for the assistance provided by the call center. \n\n";

// Always respond back in JSON format {"sentiment": "<sentiment>", "name": "<name>", "reason": "<reason>"}
interface CustomerSentimentProps {
  stringifieldChatHistory?: string;
}

export const CustomerSentiment = (props: CustomerSentimentProps) => {
  const [sentiment, setSentiment] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  useEffect(() => {
    const asyncStuff = async () => {
      setLoading(true);
      try {
        console.log("stringifiedChatHistory", props.stringifieldChatHistory);
        const result = await gptUse({
          prompt: `${prompt}\n\n${props.stringifieldChatHistory}`,
          systemMessage:
            "You are a conversation insight analysis bot. Your job is to analyze the conversation data and extract insights.",
        });
        console.log("Sentiment result: ", result.text);
        result.text && setSentiment(result.text);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    props.stringifieldChatHistory && asyncStuff();
  }, [props.stringifieldChatHistory]);

  if (loading) {
    return <Text>Loading...</Text>;
  }
  return (
    <Stack direction={"column"} paddingTop={10}>
      <Heading size={"sm"}>Sentiment Analysis</Heading>
      <Box whiteSpace="pre-wrap">{sentiment}</Box>
    </Stack>
  );
};
