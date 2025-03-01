require('dotenv').config();
const { App } = require('@slack/bolt');
const http = require('http');

console.log('Starting bot with environment:', {
  hasToken: !!process.env.SLACK_BOT_TOKEN,
  hasSigningSecret: !!process.env.SLACK_SIGNING_SECRET,
  hasAppToken: !!process.env.SLACK_APP_TOKEN
});

// Initialize the Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: 'DEBUG'
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
  console.log('==================== NEW MESSAGE ====================');
  console.log('Message event details:', {
    channel: event.channel,
    channel_type: event.channel_type,
    user: event.user,
    text: event.text,
    ts: event.ts
  });
  
  // Only process messages with text
  if (!event.text) {
    console.log('Message had no text, skipping');
    return;
  }

  // Skip messages from the bot itself
  try {
    const authTest = await client.auth.test();
    if (event.user === authTest.user_id) {
      console.log('Message is from the bot itself, skipping');
      return;
    }
  } catch (error) {
    console.error('Error checking bot identity:', error);
  }

  // Check for x.com URLs
  const matches = event.text.match(xUrlRegex);
  if (matches) {
    console.log('Found x.com/twitter.com URLs:', matches);
    const xcancelLinks = matches.map(url => {
      const converted = convertToXcancel(url);
      console.log(`Converting ${url} to ${converted}`);
      return converted;
    });
    
    try {
      // Different messages for DMs vs channels
      const isDM = event.channel_type === 'im';
      const message = isDM 
        ? `Here's your xcancel link:\n${xcancelLinks.join('\n')}`
        : `Use xcancel instead:\n${xcancelLinks.join('\n')}`;

      console.log('Sending message:', {
        channel: event.channel,
        isDM,
        xcancelLinks
      });

      await client.chat.postMessage({
        channel: event.channel,
        text: message,
        unfurl_links: true,
        unfurl_media: true
      });
      console.log('Successfully sent xcancel links');
    } catch (error) {
      console.error('Error sending reply:', error);
      // Log the full error details
      console.error('Full error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        data: error.data
      });
    }
  } else {
    console.log('No x.com URLs found in message');
  }
  console.log('==================== END MESSAGE ====================\n');
});

// Create a basic HTTP server for Render
const server = http.createServer((req, res) => {
  console.log('Received HTTP request:', req.method, req.url);
  res.writeHead(200);
  res.end('XCancel bot is running!');
});

// Start the app
(async () => {
  try {
    // Start the Slack app
    await app.start();
    console.log('🚀 XCancel bot is running!');
    
    // Test the Slack connection
    const authTest = await app.client.auth.test();
    console.log('Successfully connected to Slack workspace:', authTest.team);
    console.log('Bot user ID:', authTest.user_id);

    // Start HTTP server on the port Render provides or default to 3000
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`HTTP server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start app:', error);
    process.exit(1);
  }
})(); 