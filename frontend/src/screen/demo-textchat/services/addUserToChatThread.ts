import axios from "axios";
import { BASE_URL } from "../constants";

/**
 * to add user to thread. Components will automatically know about the new participant when calling listParticipants.
 *
 * @param threadId the acs chat thread id
 * @param userId the acs communication user id
 * @param displayName the new participant's display name
 */
export const addUserToChatThread = async (
  threadId: string,
  userId: string,
  displayName: string
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/azure/addUserToChat/${threadId}`,
      {
        Id: userId,
        DisplayName: displayName,
      }
    );
    if (response.status === 201) {
      return true;
    }

    // if we are attempting to add a user to a thread that is not a thread our admin user is already a part of to add in this user
    // we would be unable to add the user
    // so we are returning a 404 if the thread we want to add them to cannot be accessed by our server user
    else if (response.status === 404) {
      return false;
    }
  } catch (error) {
    console.error("Failed at adding user, Error: ", error);
  }
  return false;
};
