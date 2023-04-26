require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();
const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);
// get router
const openaiRouter = require("./routes/openai-router");
// const azurelanguageRouter = require("./routes/azureai-language");

// get config
const port = process.env.WEB_PORT;
const speechKey = process.env.SPEECH_SUBSCRIPTION_KEY;
const speechRegion = process.env.SPEECH_REGION;
const endpoint_id = process.env.CUSTOM_SPEECH_ENDPOINT_ID_OPTIONAL;

app.use(express.json());
app.use("/openai", openaiRouter);
// app.use("/azure/language", azurelanguageRouter);

app.get("/api/get-speech-token", async (req, res, next) => {
  res.setHeader("Content-Type", "application/json");

  if (
    speechKey === "paste-your-speech-key-here" ||
    speechRegion === "paste-your-speech-region-here"
  ) {
    res
      .status(400)
      .send("You forgot to add your speech key or region to the .env file.");
  } else {
    const headers = {
      headers: {
        "Ocp-Apim-Subscription-Key": speechKey,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    try {
      console.log(
        `Speechkey loaded for speech region ${speechRegion}. Getting token`
      );
      const tokenResponse = await axios.post(
        `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
        null,
        headers
      );
      res.send({
        token: tokenResponse.data,
        region: speechRegion,
        endpoint_id: endpoint_id,
      });
    } catch (err) {
      res.status(401).send("There was an error authorizing your speech key.");
    }
  }
});

app.listen(port, () => {
  console.log(`Express backend app listening on port ${port}`);
});
