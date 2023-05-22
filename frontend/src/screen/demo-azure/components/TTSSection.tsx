import { Button, Input } from "@chakra-ui/react";
import React from "react";
import * as speechSDK from "microsoft-cognitiveservices-speech-sdk";
import { getAZSpeechConfig } from "../services/getAZSpeechConfig";

export const TTSSection = ({ text }: { text?: string }) => {
  const [value, setValue] = React.useState("");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setValue(event.target.value);

  const { speechSynthesizer, loadingSynthesizer } =
    useTTS("ja-JP-DaichiNeural");

  React.useEffect(() => {
    // auto synthesize
    text &&
      speechSynthesizer &&
      synthesizeSpeech({ text, synthesizer: speechSynthesizer });
  }, [text, speechSynthesizer]);
  return (
    <>
      <Input
        variant="flushed"
        placeholder="text to synthesize"
        onChange={handleChange}
        value={value}
      />
      {!loadingSynthesizer && speechSynthesizer ? (
        <Button
          onClick={() => {
            synthesizeSpeech({ text: value, synthesizer: speechSynthesizer! });
          }}
        >
          Manual Synthesize
        </Button>
      ) : (
        <div>Loading...</div>
      )}
    </>
  );
};

const useTTS = (
  azureVoicename: string = "en-US-AIGenerate1Neural",
  deps = []
) => {
  const [speechSynthesizer, setSpeechSynthesizer] =
    React.useState<speechSDK.SpeechSynthesizer>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const asyncThing = async () => {
      const speechConfig = await getAZSpeechConfig();
      // ref: https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=stt#text-to-speech
      speechConfig.speechSynthesisVoiceName = azureVoicename;

      // To prevent playing on browser speaker automatically
      // const stream = speechSDK.AudioOutputStream.createPullStream();
      // const audioConfig = speechSDK.AudioConfig.fromStreamOutput(stream);
      ////////////////////////////
      const synthesizer = new speechSDK.SpeechSynthesizer(speechConfig);
      // pre-connect to reduce latency
      const connection = speechSDK.Connection.fromSynthesizer(synthesizer);
      connection.openConnection();

      setSpeechSynthesizer(synthesizer);
      setLoading(false);
    };
    asyncThing();
    return () => {
      // cleanup
      speechSynthesizer?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, azureVoicename]);
  return { speechSynthesizer, loadingSynthesizer: loading };
};

interface SynthesizeSpeechProps {
  text: string;
  synthesizer: speechSDK.SpeechSynthesizer;
}
const synthesizeSpeech = async ({
  text,
  synthesizer,
}: SynthesizeSpeechProps) => {
  console.log("synthesizing", text);
  var start = Date.now();
  synthesizer.speakTextAsync(
    text,
    (result) => {
      if (result) {
        // synthesizer.close();
        var delta = Date.now() - start; // milliseconds elapsed since start
        console.log("seconds: ", delta / 1000); // in seconds
        // return result.audioData;
      }
    },
    (error) => {
      console.log(error);
      // synthesizer.close();
    }
  );
};
