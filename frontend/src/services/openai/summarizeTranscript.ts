import axios from "axios";
const BASE_URL = "http://localhost:8080";

interface APIResponse {
  error: any;
}
interface GPTResponse extends APIResponse {
  finish_reason?: string;
  text?: string;
}
export async function summarizeTranscript(text: string): Promise<GPTResponse> {
  try {
    console.log("Summarizing transcript");
    const res = await axios.post(`${BASE_URL}/openai/gpt/summarize`, {
      transcript: text,
    });
    console.log(res);
    return res.data;
    // return { authToken: token, region: region };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
}
