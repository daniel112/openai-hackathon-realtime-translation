import React, { useEffect } from "react";
import { w3cwebsocket, IMessageEvent } from "websocket";

export class TranslationChunkResponse {
  text: string;
  group: number;
  transcriptionTime: number;
  translationTime: number;
  constructor(jsonString: string) {
    const jsonData = JSON.parse(jsonString);
    this.text = jsonData.text;
    this.group = jsonData.group;
    this.transcriptionTime = jsonData.transcriptionTime;
    this.translationTime = jsonData.translationTime;
  }
}

interface UseWebsocketProps {
  onTranslate: Function;
  onSummarize: Function;
  onVoice: Function;
}

export const useWebsocket = ({
  onTranslate,
  onSummarize,
  onVoice,
}: UseWebsocketProps) => {
  const socketRef = React.useRef<w3cwebsocket>();
  const [isConnected, setIsConnected] = React.useState(false);
  // websocket set up
  useEffect(() => {
    if (socketRef && socketRef.current) return;
    const client = new w3cwebsocket("ws://localhost:8765/");
    client.onerror = function () {
      console.log("Connection Error");
      setIsConnected(false);
    };

    client.onmessage = (event: IMessageEvent) => {
      const jsonData = JSON.parse(event.data as string);
      if (jsonData.type === "voice") {
        onVoice?.(jsonData.filename);
        return;
      }
      if (jsonData.type === "summarize") {
        onSummarize?.(jsonData.text);
        return;
      }
      const translationChunk = new TranslationChunkResponse(
        event.data as string
      );
      onTranslate?.(translationChunk);
    };

    client.onopen = function () {
      setIsConnected(true);
      console.log("WebSocket Client Connected");
      socketRef.current = client;
    };

    client.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket connection closed");
    };
  }, [onSummarize, onTranslate, onVoice]);

  return { socketRef, isConnected };
};
