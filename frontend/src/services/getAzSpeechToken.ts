import axios from "axios";
import Cookie from "universal-cookie";
const BASE_URL = "http://localhost:8080";
interface AzSpeechToken {
  authToken: string | null;
  region?: string;
  error?: any;
}

export async function getAzSpeechToken(): Promise<AzSpeechToken> {
  const cookie = new Cookie();
  const speechToken = cookie.get("speech-token");

  if (speechToken === undefined) {
    try {
      console.log("Try getting token from the express backend");
      const res = await axios.get(`${BASE_URL}/api/get-speech-token`);
      const token = res.data.token;
      const region = res.data.region;
      cookie.set("speech-token", region + ":" + token, {
        maxAge: 540,
        path: "/",
      });

      console.log("Token fetched from back-end: " + token);
      return { authToken: token, region: region };
    } catch (err) {
      console.log(err);
      return { authToken: null, error: err };
    }
  } else {
    console.log("Token fetched from cookie: " + speechToken);
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
}
