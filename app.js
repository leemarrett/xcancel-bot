require('dotenv').config();
const { App } = require('@slack/bolt');
const http = require('http');

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Regular expression to match x.com and twitter.com URLs
const xUrlRegex = /https?:\/\/((?:www\.)?(?:twitter\.com|x\.com))\/[^\s<>]+/gi;

// Function to convert x.com URLs to xcancel.com URLs
function convertToXcancel(url) {
  // Clean up any trailing characters that might have been captured
  url = url.replace(/[<>]+$/, '');
  return url.replace(/(?:twitter\.com|x\.com)/i, 'xcancel.com');
}

// Listen for message events
app.event('message', async ({ event, client }) => {
  // Only process messages with text
  if (!event.text) return;

  // Skip messages from the bot itself
  try {
    const authTest = await client.auth.test();
    if (event.user === authTest.user_id) return;
  } catch (error) {
    console.error('Error checking bot identity:', error.message);
  }

  // Check for x.com URLs
  const matches = event.text.match(xUrlRegex);
  if (matches) {
    const xcancelLinks = matches.map(url => convertToXcancel(url));
    
    try {
      // Different messages for DMs vs channels
      const isDM = event.channel_type === 'im';
      const message = isDM 
        ? `Here's your xcancel link:\n${xcancelLinks.join('\n')}`
        : `Use xcancel instead:\n${xcancelLinks.join('\n')}`;

      await client.chat.postMessage({
        channel: event.channel,
        text: message,
        unfurl_links: true,
        unfurl_media: true
      });
    } catch (error) {
      console.error('Error sending reply:', error.message);
    }
  }
});

// Create a basic HTTP server for Render
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('XCancel bot is running!');
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('XCancel bot is running!');
    
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start app:', error.message);
    process.exit(1);
  }
})(); 