import { DeleteIcon } from "@chakra-ui/icons";
import {
  Heading,
  Stack,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  IconButton,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { LanguageSelector } from "../../components/LanguageSelector";
import {
  combineValuesInOrder,
  TranslationMap,
} from "../RecordScreen/translationUtils";
import {
  ResultReason,
  SpeechRecognizer,
  TranslationRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import * as speechSDK from "microsoft-cognitiveservices-speech-sdk";
import Lottie from "react-lottie";
import recordingTransition from "../../lottie/recording-transition.json";
import { getAzSpeechToken } from "../../services/getAzSpeechToken";
import {
  summarizeTranscript,
  translateTranscript,
} from "../../services/openai";

export const DemoAzureScreen = () => {
  const [translationMap, setTranslationMap] = useState<TranslationMap>({});
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState<string>();
  const [voiceFile, setVoiceFile] = useState<string>();
  const [recognizer, setRecognizer] = useState<SpeechRecognizer>();
  const [liveFeed, setLiveFeed] = useState<string>("");
  const textGroupIndex = React.useRef(0);
  const languageFromRef = React.useRef<{ label: string; iso: string }>({
    label: "English",
    iso: "en",
  });
  const languageToRef = React.useRef<{ label: string; iso: string }>({
    label: "Spanish",
    iso: "es",
  });
  const combinedText = combineValuesInOrder(translationMap);

  useEffect(() => {
    const asyncThing = async () => {
      const tokenObj = await getAzSpeechToken();
      const audioConfig = speechSDK.AudioConfig.fromDefaultMicrophoneInput();

      const speechConfig = speechSDK.SpeechConfig.fromAuthorizationToken(
        tokenObj.authToken!,
        tokenObj.region!
      );
      speechConfig.outputFormat = speechSDK.OutputFormat.Detailed;
      speechConfig.setProperty(
        speechSDK.PropertyId.SpeechServiceResponse_PostProcessingOption,
        "default"
      );
      console.log(speechConfig);
      // speechConfig.addTargetLanguage(languageToRef.current.iso);
      // input language
      speechConfig.speechRecognitionLanguage = "en-US";
      var speechRecognizer = new speechSDK.SpeechRecognizer(
        speechConfig,
        audioConfig
      );
      setRecognizer(speechRecognizer);
    };

    if (!recognizer) {
      asyncThing();
      return;
    }
    recognizer.recognizing = async (s, e) => {
      console.log("recognizing", e.result.text);
      console.log(e.result.reason);
      // const translatedText = e.result.translations?.get?.(
      //   languageToRef.current.iso
      // );
      // console.log("translated", translatedText);

      if (e.result.reason === ResultReason.RecognizingSpeech) {
        const translateRes = await translateTranscript({
          text: e.result.text,
          fromLanguage: languageFromRef.current.iso,
          toLanguage: languageToRef.current.iso,
        });

        setLiveFeed(translateRes.text ?? "foo");
      }
    };

    recognizer.recognized = (s, e) => {
      console.log({ recognized: e, reason: e.result.reason });
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        console.log("recognized", e.result.text);
        setTranslationMap((prev) => ({
          ...prev,
          [textGroupIndex.current]: {
            text: e.result.text,
            transcriptionTime: 0,
            translationTime: 0,
          },
        }));
        setLiveFeed("");
        textGroupIndex.current++;
      }
    };
  }, [recognizer]);

  // useEffect(() => {
  //   console.log("ADDING TARGET LANGUAGE");
  //   recognizer?.addTargetLanguage(languageToRef.current.iso);
  // }, [languageToRef.current.iso]);

  return (
    <Box padding={10}>
      <Heading>Azure Speech Demo</Heading>
      <Heading size={"xs"} color="gray.400" fontWeight={"light"}>
        Translate audio in real time
      </Heading>

      <Stack direction={"row"} spacing={10} justifyContent={"space-between"}>
        <Stack direction={"column"} flex={1}>
          <InputSection
            languageFromRef={languageFromRef}
            languageToRef={languageToRef}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
          <RecordButton
            isRecording={isRecording}
            onClick={async () => {
              if (!recognizer) return;
              setIsRecording(!isRecording);
              if (!isRecording) {
                console.log("STARTING");
                recognizer.startContinuousRecognitionAsync();
              } else {
                console.log("STOPPING");
                recognizer.stopContinuousRecognitionAsync();
              }
            }}
          />
          <CallSummary summary={summary} />
        </Stack>

        <TranslatedSection
          liveFeed={liveFeed}
          text={combinedText}
          onClearPress={() => setTranslationMap({})}
          isRecording={isRecording}
          onSummarize={async () => {
            console.log("ON SUMMARIZE");
            const result = await summarizeTranscript(combinedText);
            result.text && setSummary(result.text);
          }}
          onVoice={() => {
            console.log("ON VOICE");
          }}
          voiceFile={voiceFile}
        />
      </Stack>
    </Box>
  );
};

const RecordButton = ({ onClick = () => {}, isRecording = false }) => {
  return (
    <Stack direction={"column"}>
      <Stack direction={"row"} paddingTop={5}>
        <Button colorScheme={"blue"} onClick={onClick}>
          <Text pr="1">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Text>
          <Lottie
            options={{
              loop: false,
              autoplay: false,
              animationData: recordingTransition,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            isStopped={!isRecording}
            isClickToPauseDisabled={true}
            style={{
              margin: "none",
            }}
            width={40}
            speed={3}
          />
        </Button>
      </Stack>
    </Stack>
  );
};

const InputSection = ({
  languageFromRef,
  languageToRef,
  isRecording,
  setIsRecording,
}: any) => {
  return (
    <Stack paddingTop={10} direction={"column"}>
      <Stack direction={"row"} w={600}>
        <LanguageSelector
          disabled={isRecording}
          defaultIndex={0}
          title="What language are you speaking?"
          onChange={(newValue) => {
            if (newValue) {
              console.log(`Speaking: ${newValue.labelString}`);
              languageFromRef.current = {
                iso: newValue.value,
                label: newValue.labelString!,
              };
            }
          }}
        />
        <LanguageSelector
          title="What language are you translating to?"
          defaultIndex={1}
          onChange={(newValue) => {
            if (newValue) {
              console.log(`Translating to: ${newValue.labelString}`);
              languageToRef.current = {
                iso: newValue.value,
                label: newValue.labelString!,
              };
            }
          }}
        />
      </Stack>
    </Stack>
  );
};

const CallSummary = ({ summary }: any) => {
  return (
    <Stack direction={"column"} paddingTop={10}>
      <Heading size={"md"}>Transcript Summary</Heading>
      <Text>{summary}</Text>
    </Stack>
  );
};

const TranslatedSection = ({
  liveFeed,
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
            {`${text} ${liveFeed}`}
          </Heading>
        </Box>
      </CardBody>
      {!isRecording && text && (
        <>
          <Button colorScheme={"green"} onClick={onSummarize}>
            Summarize
          </Button>
        </>
      )}
      <audio ref={audioref} />
    </Card>
  );
};
