import axios from "axios";
import { BASE_URL } from "../../screen/demo-textchat/constants";

interface APIResponse {
  error?: any;
}
interface GPTResponse extends APIResponse {
  finish_reason?: string;
  text?: string;
}

interface TranslateTranscriptProps {
  text: string;
  fromLanguage: string;
  toLanguage: string;
}

export async function translateTranscript(
  props: TranslateTranscriptProps
): Promise<GPTResponse> {
  try {
    console.log("Trasnlating transcript");
    const res = await axios.post(`${BASE_URL}/openai/gpt/translate`, {
      transcript: props.text,
      fromLanguage: props.fromLanguage,
      toLanguage: props.toLanguage,
    });
    console.log(res);
    // TODO: cleanup response interface
    return { text: res.data.content };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}
