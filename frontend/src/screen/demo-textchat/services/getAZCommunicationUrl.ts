import axios from "axios";
import { BASE_URL } from "../constants";

let endpointUrl: string | undefined;

export const getAZCommunicationUrl = async (): Promise<string> => {
  if (endpointUrl === undefined) {
    try {
      const response = await axios.get(`${BASE_URL}/azure/getCommunicationUrl`);
      const retrievedendpointUrl = response.data;
      endpointUrl = retrievedendpointUrl;
      return retrievedendpointUrl;
    } catch (error) {
      console.error("Failed at getting environment url, Error: ", error);
      throw new Error("Failed at getting environment url");
    }
  } else {
    return endpointUrl;
  }
};
