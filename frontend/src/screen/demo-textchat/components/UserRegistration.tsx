import {
  Center,
  VStack,
  Heading,
  Input,
  Button,
  Box,
  Text,
  Container,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { threadId } from "worker_threads";
import { LanguageSelector } from "../../../components/LanguageSelector";
import { addUserToChatThread } from "../services/addUserToChatThread";
import { getAZCommunicationToken } from "../services/getAZCommunicationToken";
import { getAZCommunicationUrl } from "../services/getAZCommunicationUrl";
import { sendEmojiRequest } from "../services/sendEmojiRequest";
import {
  CAT,
  FOX,
  KOALA,
  MONKEY,
  MOUSE,
  OCTOPUS,
  getEmojiBackgroundColor,
} from "../utils/getEmojiBackgroundColor";
import React from "react";
import { useNavigate } from "react-router-dom";

const avatarsList = [CAT, MOUSE, KOALA, OCTOPUS, MONKEY, FOX];

interface UserRegistrationProps {
  threadId?: string;
}

export const UserRegistration = (props: UserRegistrationProps): JSX.Element => {
  // pre-chat states
  const [selectedAvatar, setSelectedAvatar] = React.useState<string>(CAT);
  const [displayName, setDisplayName] = React.useState<string>();
  const [token, setToken] = React.useState<string>();
  const [chatIdentity, setChatIdentity] = React.useState<string>();
  const [endpointUrl, setEndpointUrl] = React.useState<string>();
  const emojiBGColor = getEmojiBackgroundColor(selectedAvatar);
  const languageRef = React.useRef<{ label: string; iso: string }>({
    label: "Spanish",
    iso: "es",
  });
  const navigate = useNavigate();

  return (
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
            //   onClick={
            //     async (): Promise<void> => {
            //     // create a new room if no threadId is provided in param
            //     let activeThreadId = threadId;
            //     if (!activeThreadId) {
            //       console.log("--> creating chat thread----");
            //       activeThreadId = await onCreateThread();
            //       if (activeThreadId) {
            //         setThreadId(activeThreadId);
            //         navigate(`/demo-textchat/${activeThreadId}`);
            //       }
            //     }

            //     // join the room
            //     const token = await getAZCommunicationToken();
            //     const endpointUrl = await getAZCommunicationUrl();
            //     setToken(token.token);
            //     setChatIdentity(token.identity);
            //     setEndpointUrl(endpointUrl);

            //     // update the user profile with selected emoji avatar
            //     await sendEmojiRequest(token.identity, selectedAvatar);

            //     // attempt to add this user to the chat thread
            //     const result = await addUserToChatThread(
            //       activeThreadId,
            //       token.identity,
            //       displayName!
            //     );
            //     if (!result) {
            //       console.log("Failed to join thread");
            //     }
            //   }
            // }
          >
            {props.threadId ? "Join Room" : "Create Room"}
          </Button>
        </Box>
      </VStack>
    </Center>
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
