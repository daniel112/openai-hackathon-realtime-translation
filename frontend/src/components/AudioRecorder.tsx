import { Button, Center, Text, Stack } from "@chakra-ui/react";
import { useState } from "react";
import { w3cwebsocket } from "websocket";
import Lottie from "react-lottie";

import recordingTransition from "../lottie/recording-transition.json";

import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import React from "react";

interface AudioRecorderProps {
  socketRef: React.MutableRefObject<w3cwebsocket>;
  onStartRecording: Function;
  onStopRecording: Function;
  languageFromRef: React.MutableRefObject<{ label: string; iso: string }>;
  languageToRef: React.MutableRefObject<{ label: string; iso: string }>;
}

/**
 * in miliseconds, the amount of time each audio chunk lasts
 */
const CHUNK_TIME_SLICE = 600;

/**
 * This component is responsible for recording audio and streaming it to the backend
 * @param {React.MutableRefObject<w3cwebsocket>} socketRef - reference to the useWebsocket instance ref object
 */
export const AudioRecorder = ({
  socketRef,
  onStartRecording,
  onStopRecording,
  languageFromRef,
  languageToRef,
}: AudioRecorderProps) => {
  const [mediaStream, setMediaStream] = useState<MediaStream>();
  const [recordRTC, setRecordRTC] = useState<RecordRTC>();
  const [mediaUrl, setMediaUrl] = useState<string>();

  const startRecording = () => {
    onStartRecording?.();
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        const record = new RecordRTC(stream, {
          type: "audio",
          mimeType: "audio/wav",
          recorderType: StereoAudioRecorder,
          timeSlice: CHUNK_TIME_SLICE,
          // sampleRate: 44100,
          // desiredSampRate: 16000,
          numberOfAudioChannels: 1,

          /**
           * Sends audio chunks to backend server for processing
           * Sends a stringified JSON object 'socketObj'
           */
          ondataavailable: async (blob) => {
            if (!socketRef.current) return;
            console.log("Sending audio blob...");
            let reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = function () {
              var audioBase64 = reader.result as string;
              let audioTurned = audioBase64?.substr(
                audioBase64?.indexOf(",") + 1
              );
              const socketObj = {
                name: "audio",
                data: audioTurned,
                languageFrom: languageFromRef.current,
                languageTo: languageToRef.current,
              };
              socketRef.current!.send(JSON.stringify(socketObj));
            };
          },
        });
        setRecordRTC(record);
        setMediaStream(stream);
        record.startRecording();
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const stopRecording = () => {
    onStopRecording?.();
    recordRTC &&
      recordRTC.stopRecording(() => {
        const blob = recordRTC.getBlob();
        const url = URL.createObjectURL(blob);
        setMediaUrl(url);
        // do something with the recorded file, such as download it or play it
      });
    mediaStream && mediaStream.getTracks().forEach((track) => track.stop());
  };

  return (
    <Stack direction={"column"}>
      <Stack direction={"row"} paddingTop={5}>
        <Button
          colorScheme={"blue"}
          onClick={
            recordRTC?.getState() === "recording"
              ? stopRecording
              : startRecording
          }
        >
          <Text pr="1">
            {recordRTC?.getState() === "recording"
              ? "Stop Recording"
              : "Start Recording"}
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
            isStopped={recordRTC?.getState() !== "recording"}
            isClickToPauseDisabled={true}
            style={{
              margin: "none",
            }}
            width={40}
            speed={3}
          />
        </Button>
      </Stack>
      <Center pt={5} h="300">
        <audio src={mediaUrl} controls />
      </Center>
    </Stack>
  );
};
