# XCancel Slack Bot

A Slack bot that automatically converts x.com and twitter.com links to xcancel.com links.

## Environment Variables

The following environment variables are required:

```
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
```

## Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the required environment variables

3. Start the bot:
```bash
npm start
```

## Deployment

This bot is configured to deploy on Render. Required environment variables should be set in the Render dashboard.

## Setup Instructions

1. Create a new Slack App at https://api.slack.com/apps
2. Under "OAuth & Permissions", add the following bot token scopes:
   - `chat:write` (to post messages)
   - `channels:history` (to read messages in channels)
   - `groups:history` (to read messages in private channels)

3. Install the app to your workspace

4. Copy the following tokens from your Slack App settings:
   - Bot User OAuth Token (starts with `xoxb-`)
   - Signing Secret
   - App-Level Token (create one with `connections:write` scope if not exists)

5. Create a `.env` file in the project root and add your tokens:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   ```

6. Install dependencies:
   ```bash
   npm install
   ```

7. Start the bot:
   ```bash
   node app.js
   ```

## Usage

Simply share any x.com or twitter.com link in a channel where the bot is present. The bot will automatically reply with the equivalent xcancel.com link in a thread.

## Features

- Automatically detects x.com and twitter.com URLs
- Supports multiple URLs in a single message
- Replies in threads to keep channels clean
- Supports both www and non-www URLs 