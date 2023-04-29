const {
  CommunicationAccessToken,
  CommunicationIdentityClient,
  CommunicationUserToken,
  TokenScope,
} = require("@azure/communication-identity");

const getIdentityClient = new CommunicationIdentityClient(
  process.env.RESOURCE_CONNECTION_STRING
);

const getCommunicationEndpoint = () => {
  const uri = new URL(process.env.COMMUNICATION_ENDPOINT);
  return `${uri.protocol}//${uri.host}`;
};

module.exports = {
  getIdentityClient,
  getCommunicationEndpoint,
};
