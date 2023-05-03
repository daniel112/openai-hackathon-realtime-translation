import axios from "axios";
import { BASE_URL } from "../../screen/demo-textchat/constants";

interface APIResponse {
  error?: any;
}
interface GPTResponse extends APIResponse {
  finish_reason?: string;
  text?: string;
}

export interface GPTUseRequest {
  systemMessage: string;
  prompt: string;
}

export const gptUse = async (props: GPTUseRequest): Promise<GPTResponse> => {
  const { systemMessage, prompt } = props;
  try {
    const res = await axios.post(`${BASE_URL}/openai/gpt/use`, {
      systemMessage,
      prompt,
    });
    return { text: res.data.content };
  } catch (err) {
    console.log(err);
    return { error: err };
  }
};
