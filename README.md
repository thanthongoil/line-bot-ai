# LINE + OpenAI Chatbot

A minimal LINE Messaging API bot that replies to text messages using OpenAI, deployable on Railway.

## How it works

- `POST /webhook` receives events from LINE, verified against `LINE_CHANNEL_SECRET`.
- Each text message is sent to OpenAI (`OPENAI_MODEL`, default `gpt-4o-mini`) with `SYSTEM_PROMPT` as system context.
- The reply is sent back via LINE's reply API using `LINE_CHANNEL_ACCESS_TOKEN`.

## Local setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in your own values.

```bash
npm start
```

The server listens on `PORT` (default 3000).

## Deploy to Railway

1. Push this repo to GitHub (already done if you're reading this from the repo) and connect it to a Railway project ("Deploy from GitHub repo"), or use the Railway CLI (`railway init`, `railway up`) from this folder.
2. In the Railway project's **Variables** tab, add:
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `LINE_CHANNEL_SECRET`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional)
   - `SYSTEM_PROMPT` (optional)
3. Generate a public domain (Settings → Networking → Generate Domain). Railway injects `PORT` automatically.
4. Your webhook URL will be: `https://<your-railway-domain>/webhook`

## Configure the LINE webhook

1. Go to the [LINE Developers Console](https://developers.line.biz/console/) → your channel → **Messaging API** tab.
2. Set **Webhook URL** to `https://<your-railway-domain>/webhook` and click **Verify**.
3. Enable **Use webhook**.
4. Under **LINE Official Account features**, turn OFF "Auto-reply messages" and "Greeting messages" if you want only the bot's OpenAI-generated replies.

## Security notes

- `.env` is git-ignored. Never commit real secrets.
- If any keys were ever shared in plaintext (chat, screenshots, etc.), rotate them in the LINE Developers Console and OpenAI dashboard.
