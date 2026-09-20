require('dotenv').config();

const express = require('express');
const { middleware, Client } = require('@line/bot-sdk');
const OpenAI = require('openai');

const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

for (const [key, value] of Object.entries({
  LINE_CHANNEL_ACCESS_TOKEN: lineConfig.channelAccessToken,
  LINE_CHANNEL_SECRET: lineConfig.channelSecret,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
})) {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

const lineClient = new Client(lineConfig);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  process.env.SYSTEM_PROMPT ||
  'You are a helpful, friendly assistant replying to users in a LINE chat. Keep replies concise.';

const app = express();

app.get('/', (_req, res) => {
  res.status(200).send('LINE OpenAI chatbot is running.');
});

// LINE's middleware verifies the X-Line-Signature header using the channel
// secret and must receive the raw body, so it must run before any JSON parser.
app.post('/webhook', middleware(lineConfig), async (req, res) => {
  try {
    await Promise.all((req.body.events || []).map(handleEvent));
    res.status(200).end();
  } catch (err) {
    console.error('Error handling webhook events:', err);
    res.status(200).end(); // Always ack LINE to avoid retry storms
  }
});

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return null;
  }

  const userText = event.message.text;

  let replyText;
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
    });
    replyText = completion.choices[0]?.message?.content?.trim() || 'Sorry, I have no reply for that.';
  } catch (err) {
    console.error('OpenAI error:', err);
    replyText = 'Sorry, something went wrong generating a reply.';
  }

  return lineClient.replyMessage(event.replyToken, {
    type: 'text',
    text: replyText,
  });
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
