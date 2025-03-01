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

If you're using Render's free tier, use something like uptimerobot.com to ping it and keep it awake.

## Setup Instructions

1. Create a new Slack App at https://api.slack.com/apps
2. Under "OAuth & Permissions", add the following bot token scopes:
   - `chat:write` (to post messages)
   - `channels:history` (to read messages in channels)
   - `groups:history` (to read messages in private channels)
   - `im:history` (to read direct messages)
   - `im:write` (to send direct messages)

3. Under "Event Subscriptions", subscribe to the following bot events:
   - `message.channels` (to see messages in channels)
   - `message.groups` (to see messages in private channels)
   - `message.im` (to see direct messages)

4. Enable Socket Mode in your Slack App settings

5. Install the app to your workspace

6. Copy the following tokens from your Slack App settings:
   - Bot User OAuth Token (starts with `xoxb-`)
   - Signing Secret
   - App-Level Token (create one with `connections:write` scope if not exists)

7. Create a `.env` file in the project root and add your tokens:
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   SLACK_APP_TOKEN=xapp-your-app-token
   ```

## Usage

For channels:
1. Invite the bot using `/invite @xcancel` in any channel (public or private)
2. Share any x.com or twitter.com links

For direct messages:
1. Start a direct message with @xcancel
2. Share any x.com or twitter.com links

The bot will automatically reply with the xcancel.com version of any x.com or twitter.com links shared.

## Features

- Automatically detects x.com and twitter.com URLs
- Supports multiple URLs in a single message
- Works in:
  - Public channels (requires `/invite @xcancel`)
  - Private channels (requires `/invite @xcancel`)
  - Direct messages (just message @xcancel)
- Supports both www and non-www URLs 