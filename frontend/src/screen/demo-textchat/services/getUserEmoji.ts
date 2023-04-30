import axios from "axios";
import { BASE_URL } from "../constants";

const emojiCache = new Map<string, Promise<string>>();

const getUserEmoji = async (userId: string): Promise<string> => {
  const response = await axios.get(
    `${BASE_URL}/azure/chatUserConfig/${userId}`
  );
  return response.data.emoji;
};

/**
 * Returns emoji string to caller based on userId. If emoji already exists in cache, return the cached emoji. Otherwise
 * makes a server request to get emoji. The returned emoji is a Promise<string> which may or may not be resolved so
 * caller should await it. There could potentially be many awaits happening so we may need to consider a callback style
 * approach.
 *
 * @param userId
 */
export const fetchEmojiForUser = (userId: string): Promise<string> => {
  const emoji = emojiCache.get(userId);
  if (emoji === undefined) {
    const promise: Promise<string> = getUserEmoji(userId);
    emojiCache.set(userId, promise);
    return promise;
  } else {
    return emoji;
  }
};
