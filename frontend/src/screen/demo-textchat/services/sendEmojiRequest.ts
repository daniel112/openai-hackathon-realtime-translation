import axios from "axios";
import { BASE_URL } from "../constants";

export const sendEmojiRequest = async (
  identity: string,
  emoji: string
): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/azure/chatUserConfig/${identity}`, {
      Emoji: emoji,
    });
  } catch (error) {
    console.error("Failed at setting emoji, Error: ", error);
  }
};
