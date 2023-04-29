import {
  Button,
  Center,
  Container,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";
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

const avatarsList = [CAT, MOUSE, KOALA, OCTOPUS, MONKEY, FOX];

/**
 * ref: https://github.com/Azure-Samples/communication-services-javascript-quickstarts/tree/main/add-chat
 */
export const TextChatHomeScreen = (): JSX.Element => {
  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(CAT);
  const [username, setUsername] = React.useState<string>();

  const navigate = useNavigate();
  const emojiBGColor = getEmojiBackgroundColor(selectedAvatar);
  // two ChakraUI buttons with "Join" and "Create"
  return (
    <Center>
      <VStack pr={10}>
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
        <Text>{username}</Text>
      </VStack>
      <VStack>
        <AvatarSection
          onChange={(avatar: string) => {
            setSelectedAvatar(avatar);
          }}
        />
        <Input
          placeholder="Username"
          onChange={(ev) => setUsername(ev.target.value)}
        />
        <Button
          w={"100%"}
          colorScheme="blue"
          onClick={async () => {
            const threadId = await onCreateThread();
            if (threadId) {
              console.log({ threadId });
              // navigate(`/demo-textchat/${threadId}`);
            }
          }}
        >
          Create
        </Button>
      </VStack>
    </Center>
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
