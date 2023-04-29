import axios from "axios";
import { BASE_URL } from "../constants";

export type UserToken = {
  expiresOn: number;
  identity: string;
  token: string;
};

export const getAZCommunicationToken = async (): Promise<UserToken> => {
  const getTokenResponse = await axios.get(
    `${BASE_URL}/azure/communicationToken?scope=chat`
  );
  const responseJson = await getTokenResponse.data;
  return {
    expiresOn: responseJson.expiresOn,
    identity: responseJson.user.communicationUserId,
    token: responseJson.token,
  };
};
