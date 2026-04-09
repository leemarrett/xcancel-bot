require('dotenv').config();
const { App } = require('@slack/bolt');

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Fresh RegExp per call so .matchAll is safe (global regexes are stateful)
function extractXUrls(text) {
  if (!text) return [];
  const re = /<?(https?:\/\/(?:x\.com|twitter\.com)\/[^\s|>]+)[^>]*>?/gi;
  return [...text.matchAll(re)].map((m) => m[1]);
}

// Function to convert x.com URLs to xcancel.com URLs
function convertToXcancel(url) {
  // Extract the actual URL, handling both bare URLs and Slack's formatted URLs
  const actualUrl = url.match(/<?(https?:\/\/[^|>]+)/)?.[1] || url;
  // Convert to xcancel.com
  return actualUrl.replace(/(?:twitter\.com|x\.com)/i, 'xcancel.com');
}

let botUserId;

function buildResponse(convertedLinks, isDM) {
  return isDM
    ? `Here's your xcancel link:\n${convertedLinks.join('\n')}`
    : `No x.com account? I got u:\n${convertedLinks.join('\n')}`;
}

async function sayXcancelReply({ say, event, convertedLinks }) {
  const isDM = event.channel_type === 'im';
  const response = buildResponse(convertedLinks, isDM);
  await say(
    event.thread_ts
      ? { text: response, thread_ts: event.thread_ts }
      : response
  );
}

// Handle Socket Mode lifecycle events
app.client.on('unable_to_socket_mode_start', async (error) => {
  console.error('Unable to start Socket Mode:', error.message);
  // Wait a bit and restart the app
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});

app.client.on('socket_mode_connecting', () => {
  console.log('Connecting to Slack...');
});

app.client.on('socket_mode_connected', () => {
  console.log('Connected to Slack!');
});

app.client.on('socket_mode_disconnected', () => {
  console.log('Disconnected from Slack');
});

app.client.on('socket_mode_error', (error) => {
  console.error('Socket Mode Error:', error.message);
});

// Listen for message events (bare links; @mention + link is handled by app_mention to avoid duplicate deliveries)
app.event('message', async ({ event, say }) => {
  try {
    // Skip messages from the bot itself
    if (event.bot_id) return;

    // Skip messages without text
    if (!event.text) return;

    // Slack can send both message.* and app_mention for the same @mention message
    if (botUserId && event.text.includes(`<@${botUserId}>`)) return;

    const convertedLinks = extractXUrls(event.text).map(convertToXcancel);
    if (convertedLinks.length === 0) return;

    await sayXcancelReply({ say, event, convertedLinks });
  } catch (error) {
    console.error('Error processing message:', error.message);
  }
});

// Explicit @xcancel … invocations (channels only; not fired for DMs)
app.event('app_mention', async ({ event, say }) => {
  try {
    const convertedLinks = extractXUrls(event.text).map(convertToXcancel);
    if (convertedLinks.length === 0) {
      const hint =
        'Include an x.com or twitter.com link in your message and I’ll post the xcancel version.';
      await say(
        event.thread_ts
          ? { text: hint, thread_ts: event.thread_ts }
          : hint
      );
      return;
    }
    await sayXcancelReply({ say, event, convertedLinks });
  } catch (error) {
    console.error('Error processing app_mention:', error.message);
  }
});

// Start the app
(async () => {
  try {
    const auth = await app.client.auth.test({ token: process.env.SLACK_BOT_TOKEN });
    botUserId = auth.user_id;
    await app.start();
    console.log('XCancel bot is running!');
  } catch (error) {
    console.error('Error starting app:', error.message);
    process.exit(1);
  }
})();

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error.message);
  // Wait a bit and exit (Render will restart the process)
  setTimeout(() => process.exit(1), 5000);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error.message);
  // Wait a bit and exit (Render will restart the process)
  setTimeout(() => process.exit(1), 5000);
}); 