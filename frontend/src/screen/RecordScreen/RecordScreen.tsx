import { DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useState } from "react";
import { AudioRecorder } from "../../components/AudioRecorder";
import { LanguageSelector } from "../../components/LanguageSelector";
import {
  TranslationChunkResponse,
  useWebsocket,
} from "../../hooks/useWebsocket";
import {
  TranslationMap,
  combineValuesInOrder,
  averageTranslationTime,
  averageTranscriptionTime,
} from "./translationUtils";

export const RecordScreen = () => {
  const [translationMap, setTranslationMap] = useState<TranslationMap>({});
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState<string>();
  const [voiceFile, setVoiceFile] = useState<string>();

  const { socketRef, isConnected } = useWebsocket({
    onTranslate: (response: TranslationChunkResponse) => {
      setTranslationMap((prev) => ({
        ...prev,
        [response.group]: {
          ...response,
        },
      }));
    },
    onSummarize: (text: string) => setSummary(text),
    onVoice: (filename: string) => setVoiceFile(filename),
  });
  const combinedText = combineValuesInOrder(translationMap);

  return (
    <Box padding={10}>
      <Heading>Babel Fish</Heading>
      <Heading size={"xs"} color="gray.400" fontWeight={"light"}>
        Translate audio in real time
      </Heading>
      {!isConnected && (
        <Heading size={"xs"} color="red.400" fontWeight={"light"}>
          Not connected to server. Try refreshing the browser
        </Heading>
      )}

      <Stack direction={"row"} spacing={10} justifyContent={"space-between"}>
        <InputSection
          socketRef={socketRef}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
        <TranslatedSection
          text={combinedText}
          onClearPress={() => setTranslationMap({})}
          isRecording={isRecording}
          onSummarize={React.useCallback(() => {
            const socketObj = {
              name: "summarize",
              data: combinedText,
            };
            socketRef.current!.send(JSON.stringify(socketObj));
          }, [combinedText, socketRef])}
          onVoice={React.useCallback(() => {
            const socketObj = {
              name: "voice",
              data: combinedText,
            };
            socketRef.current!.send(JSON.stringify(socketObj));
          }, [combinedText, socketRef])}
          voiceFile={voiceFile}
        />
      </Stack>
      <InfoSection
        translationTime={averageTranslationTime(translationMap)}
        transcriptionTime={averageTranscriptionTime(translationMap)}
        summary={summary}
      />
    </Box>
  );
};

const InputSection = ({ socketRef, isRecording, setIsRecording }: any) => {
  const languageFromRef = React.useRef<{ label: string; iso: string }>({
    label: "English",
    iso: "en",
  });
  const languageToRef = React.useRef<{ label: string; iso: string }>({
    label: "Spanish",
    iso: "es",
  });
  return (
    <Stack paddingTop={10} direction={"column"}>
      <Stack direction={"row"} w={600}>
        <LanguageSelector
          disabled={isRecording}
          defaultIndex={0}
          title="What language are you speaking?"
          onChange={(newValue) => {
            if (newValue) {
              languageFromRef.current = {
                iso: newValue.value,
                label: newValue.labelString!,
              };
            }
          }}
        />
        <LanguageSelector
          // disabled={isRecording}
          title="What language are you translating to?"
          defaultIndex={1}
          onChange={(newValue) => {
            if (newValue) {
              languageToRef.current = {
                iso: newValue.value,
                label: newValue.labelString!,
              };
            }
          }}
        />
      </Stack>
      <AudioRecorder
        languageFromRef={languageFromRef}
        languageToRef={languageToRef}
        socketRef={socketRef}
        onStartRecording={() => {
          setIsRecording(true);
        }}
        onStopRecording={() => {
          setIsRecording(false);
        }}
      />
    </Stack>
  );
};

const TranslatedSection = ({
  text,
  onClearPress,
  isRecording,
  onSummarize,
  onVoice,
  voiceFile,
}: any) => {
  const audioref = React.useRef<HTMLAudioElement>(null);
  const [isVoiceLoading, setVoiceLoading] = useState(false);
  useEffect(() => {
    if (!audioref.current || !voiceFile) return;
    setVoiceLoading(false);
    const audiodata = require(`../../audio/${voiceFile}`);
    audioref.current.src = audiodata;
    audioref.current.play();
  }, [voiceFile]);

  return (
    <Card variant={"filled"} width={"100%"} maxW={700}>
      <CardHeader>
        <Heading size="md">
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Text alignSelf={"center"}>Live Translation</Text>
            {text && (
              <IconButton
                aria-label="clear-translation"
                icon={<DeleteIcon />}
                onClick={onClearPress}
              />
            )}
          </Stack>
        </Heading>
        <Divider pt={5} />
      </CardHeader>
      <CardBody>
        <Box maxH={500} h={500} overflowY="auto">
          <Heading size="xs" fontWeight={"medium"} lineHeight={6}>
            {text}
          </Heading>
        </Box>
      </CardBody>
      {!isRecording && text && (
        <>
          <Button colorScheme={"green"} onClick={onSummarize}>
            Summarize
          </Button>
          <Button
            colorScheme={"blue"}
            mt={4}
            onClick={() => {
              setVoiceLoading(true);
              onVoice();
            }}
            isDisabled={isVoiceLoading}
          >
            {isVoiceLoading ? "Loading..." : "Voice"}
          </Button>
        </>
      )}
      <audio ref={audioref} />
    </Card>
  );
};

/**
 * Displays processing information
 */
const InfoSection = ({ transcriptionTime, translationTime, summary }: any) => {
  return (
    <Stack>
      <Text>
        Avg transcription time (Offline Whisper Model): {transcriptionTime}{" "}
        second(s)
      </Text>
      <Text>
        Avg translation time (Azure GPT3.5): {translationTime} second(s)
      </Text>
      {summary && (
        <>
          <Heading>Summary:</Heading>
          <Text>{summary}</Text>
        </>
      )}
    </Stack>
  );
};
