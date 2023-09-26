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
import { LanguageSelector, languageMap, LanguageOption } from "../../components/LanguageSelector";
import {
  combineValuesInOrder,
  TranslationMap,
} from "../RecordScreen/translationUtils";
import {
  ResultReason,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import * as speechSDK from "microsoft-cognitiveservices-speech-sdk";
import Lottie from "react-lottie";
import recordingTransition from "../../lottie/recording-transition.json";
import {
  summarizeTranscript,
  translateTranscript,
} from "../../services/openai";
import { getAZSpeechConfig } from "./services/getAZSpeechConfig";

export const DemoAzureScreen = ({ 
  defaultSourceLang = languageMap.English,
  defaultDestinationLang = languageMap.Hindi
}: { 
  defaultSourceLang?: LanguageOption,
  defaultDestinationLang?: LanguageOption
}) => {
  const [translationMap, setTranslationMap] = useState<TranslationMap>({});
  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState<string>();
  const [recognizer, setRecognizer] = useState<SpeechRecognizer>();
  const textGroupIndex = React.useRef(0);

  const languageFromRef = React.useRef<LanguageOption>(defaultSourceLang);
  const languageToRef = React.useRef<LanguageOption>(defaultDestinationLang);

  const combinedText = combineValuesInOrder(translationMap);

  useEffect(() => {
    const asyncThing = async () => {
      const speechConfig = await getAZSpeechConfig();
      const audioConfig = speechSDK.AudioConfig.fromDefaultMicrophoneInput();

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
      // console.log(e.result.reason);
      // const translatedText = e.result.translations?.get?.(
      //   languageToRef.current.iso
      // );
      // console.log("translated", translatedText);

      // if (e.result.reason === ResultReason.RecognizingSpeech) {
      // const translateRes = await translateTranscript({
      //   text: e.result.text,
      //   fromLanguage: languageFromRef.current.iso,
      //   toLanguage: languageToRef.current.iso,
      // });

      //   setLiveFeed(translateRes.text ?? "foo");
      // }
    };

    recognizer.recognized = async (s, e) => {
      console.log({ recognized: e, reason: e.result.reason });

      if (e.result.reason === ResultReason.RecognizedSpeech) {
        const translateRes = await translateTranscript({
          text: e.result.text,
          fromLanguage: languageFromRef.current.iso,
          toLanguage: languageToRef.current.iso,
        });
        setTranslationMap((prev) => ({
          ...prev,
          [textGroupIndex.current]: {
            text: translateRes.text!, //e.result.text,
            transcriptionTime: 0,
            translationTime: 0,
          },
        }));
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
          text={combinedText}
          onClearPress={() => setTranslationMap({})}
          isRecording={isRecording}
          onSummarize={async () => {
            console.log("ON SUMMARIZE");
            const result = await summarizeTranscript(combinedText);
            result.text && setSummary(result.text);
          }}
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
          defaultLanguage={defaultSourceLang}
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
          defaultLanguage={defaultDestinationLang}
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
  text,
  onClearPress,
  isRecording,
  onSummarize,
}: any) => {
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
            {`${text}`}
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
    </Card>
  );
};
