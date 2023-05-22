import { getAzSpeechToken } from "../../../services/getAzSpeechToken";
import * as speechSDK from "microsoft-cognitiveservices-speech-sdk";

/**
 * @description Get Azure Speech Config from api server
 * @returns speechSDK.SpeechConfig
 */
export const getAZSpeechConfig = async () => {
  const tokenObj = await getAzSpeechToken();
  const speechConfig = speechSDK.SpeechConfig.fromAuthorizationToken(
    tokenObj.authToken!,
    tokenObj.region!
  );
  return speechConfig;
};
