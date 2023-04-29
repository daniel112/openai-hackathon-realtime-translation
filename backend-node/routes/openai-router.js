const express = require("express");
const router = express.Router();
const axios = require("axios");
const openaiconfig = require("./openai-config.json");
const { Configuration, OpenAIApi } = require("openai");

//Set up OpenAI API key and endpoint
const openaiKey = process.env.OPENAI_KEY;
const openaiEndpoint = process.env.OPENAI_ENDPOINT;
const openaiDeploymentName = process.env.OPENAI_DEPLOYMENT_NAME;

//Set up OpenAI GPT-3 parameters
const openaiMaxTokens = openaiconfig[0].openai_max_tokens;
const openaiTemperature = openaiconfig[0].openai_temperature;
const openaiTopP = openaiconfig[0].openai_top_p;
const openaiFrequencyPenalty = openaiconfig[0].openai_frequency_penalty;
const openaiPresencePenalty = openaiconfig[0].openai_presence_penalty;
const openaiApiVersion = openaiconfig[0].openai_api_version;

const configuration = new Configuration({
  apiKey: openaiKey,
  basePath: `${openaiEndpoint}openai/deployments/${openaiDeploymentName}`,
  baseOptions: {
    headers: { "api-key": openaiKey },
    params: {
      "api-version": "2023-03-15-preview",
    },
  },
});
const openai = new OpenAIApi(configuration);

//Set up OpenAI GPT-3 prompts by business domain
const generalPrompt = openaiconfig[0].general_prompt;

router.post("/gpt/summarize", async (req, res) => {
  const requestText = JSON.stringify(req.body.transcript);
  const completion = await openai.createChatCompletion({
    // engine: openaiDeploymentName,
    messages: [
      {
        role: "system",
        content:
          "You are a transcript summarizer. Please summarize the transcript given by the user. Summarize the text into english",
      },
      { role: "user", content: requestText },
    ],
    temperature: openaiTemperature,
    top_p: openaiTopP,
  });

  res.send(completion.data.choices[0].message);
});

/**
 * This endpoint is used to translate text from one language to another.
 * @param {string} req.body.transcript - The text to be translated.
 * @param {string} req.body.fromLanguage - The language to translate from.
 * @param {string} req.body.toLanguage - The language to translate to.
 */
router.post("/gpt/translate", async (req, res) => {
  const requestText = JSON.stringify(req.body.transcript);
  const fromLanguage = JSON.stringify(req.body.fromLanguage);
  const toLanguage = JSON.stringify(req.body.toLanguage);

  const completion = await openai.createChatCompletion({
    // engine: openaiDeploymentName,
    messages: [
      {
        role: "system",
        content: `You are an accurate language translator that will translate ${fromLanguage} text to ${toLanguage}. Do not include the pronounciation. You reply only with the direct translation, with brief to-the-point answers with no elaboration.`,
      },
      { role: "user", content: `Translate the following: ${requestText}` },
    ],
    temperature: openaiTemperature,
    top_p: openaiTopP,
  });

  res.send(completion.data.choices[0].message);
});

// router.post("/gpt/parseExtractInfo", async (req, res) => {
//   const requestText = JSON.stringify(req.body.transcript);
//   const requestPromptCategory = req.body.parsePromptCategory;
//   let requestPrompt = "";
//   console.log("Request prompt category: " + requestPromptCategory);

//   if (requestPromptCategory == "Insurance") {
//     requestPrompt = insurancePrompt;
//   } else if (requestPromptCategory == "Healthcare") {
//     requestPrompt = healthcarePrompt;
//   } else if (requestPromptCategory == "Banking") {
//     requestPrompt = bankingPrompt;
//   } else if (requestPromptCategory == "CapitalMarkets") {
//     requestPrompt = capitalMarketsPrompt;
//   } else {
//     requestPrompt = generalPrompt;
//   }

//   console.log("Using Request prompt: " + requestPrompt);
//   const parsePrompt = requestText + "\n\n" + requestPrompt;

//   const url =
//     openaiEndpoint +
//     "openai/deployments/" +
//     openaiDeploymentName +
//     "/completions?api-version=" +
//     openaiApiVersion;

//   //console.log('Prompt for parseExtractInfo ' + parsePrompt);
//   const headers = { "Content-Type": "application/json", "api-key": openaiKey };
//   const params = {
//     prompt: parsePrompt,
//     max_tokens: 900,
//     temperature: 0,
//     top_p: 1,
//     frequency_penalty: 0,
//     presence_penalty: 0,
//   };

//   const parseResponse = await axios.post(url, params, { headers: headers });
//   //console.log('Parse response: ' + parseResponse.data);
//   res.send(parseResponse.data.choices[0]);
// });

module.exports = router;
