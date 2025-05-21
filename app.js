require('dotenv').config();
const { App } = require('@slack/bolt');

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Regular expression to match x.com and twitter.com URLs
const xUrlRegex = /<?(https?:\/\/(x\.com|twitter\.com)\/[^\s|>]+)[^>]*>?/g;

// Function to convert x.com URLs to xcancel.com URLs
function convertToXcancel(url) {
  // Extract the actual URL, handling both bare URLs and Slack's formatted URLs
  const actualUrl = url.match(/<?(https?:\/\/[^|>]+)/)?.[1] || url;
  // Convert to xcancel.com
  return actualUrl.replace(/(?:twitter\.com|x\.com)/i, 'xcancel.com');
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

// Listen for message events
app.event('message', async ({ event, say }) => {
  try {
    // Skip messages from the bot itself
    if (event.bot_id) return;

    // Skip messages without text
    if (!event.text) return;

    // Find x.com or twitter.com URLs
    const matches = event.text.match(xUrlRegex);
    if (!matches) return;

    // Convert URLs to xcancel.com
    const convertedLinks = matches.map(url => convertToXcancel(url));

    // Send response
    const isDM = event.channel_type === 'im';
    const response = isDM 
      ? `Here's your xcancel link:\n${convertedLinks.join('\n')}`
      : `No x.com account? I got u:\n${convertedLinks.join('\n')}`;

    await say(response);
  } catch (error) {
    console.error('Error processing message:', error.message);
  }
});

// Start the app
(async () => {
  try {
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