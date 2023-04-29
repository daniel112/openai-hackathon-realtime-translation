import axios from "axios";
import { BASE_URL } from "../constants";

/**
 * Creates a new chat thread
 * @returns {string} - The threadId of the created thread
 */
export const createChatThread = async (): Promise<string> => {
  try {
    const response = await axios.post(`${BASE_URL}/azure/createChatThread`);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Failed at creating thread " + response.status);
    }
  } catch (error) {
    console.error("Failed creating thread, Error: ", error);
    throw new Error("Failed at creating thread");
  }
};
