const express = require("express");
const router = express.Router();
const {
  getCommunicationEndpoint,
} = require("../../utils/azure/communication-service");
/**
 * route: /getEndpointUrl/
 *
 * purpose: Get the endpoint url of Azure Communication Services resource.
 *
 * @returns The endpoint url as string
 *
 */

router.get("/getCommunicationUrl", async function (req, res, next) {
  res.send(getCommunicationEndpoint());
});

module.exports = router;
