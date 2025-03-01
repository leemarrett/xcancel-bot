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

// Listen for the bot being added to a channel
app.event('member_joined_channel', async ({ event, client }) => {
  console.log('Member joined channel event received:', event);
  // Check if the member that joined is our bot
  try {
    const authTest = await client.auth.test();
    console.log('Auth test result:', authTest);
    if (event.user === authTest.user_id) {
      console.log('Bot was added to channel:', event.channel);
      try {
        await client.chat.postMessage({
          channel: event.channel,
          text: "👋 Hey! I'm going to post links to xcancel.com when I see x.com links in chat."
        });
        console.log('Welcome message sent successfully');
      } catch (error) {
        console.error('Error sending welcome message:', error);
      }
    }
  } catch (error) {
    console.error('Error in member_joined_channel handler:', error);
  }
});

// Listen for message events
app.event('message', async ({ event, client }) => {
  console.log('Message event received:', event);
  
  // Only process messages with text
  if (!event.text) {
    console.log('Message had no text, skipping');
    return;
  }

  // Check for x.com URLs
  const matches = event.text.match(xUrlRegex);
  if (matches) {
    console.log('Found matches:', matches);
    const xcancelLinks = matches.map(url => convertToXcancel(url));
    console.log('Converted to xcancel links:', xcancelLinks);
    
    try {
      await client.chat.postMessage({
        channel: event.channel,
        text: `Use xcancel instead:\n${xcancelLinks.join('\n')}`,
        unfurl_links: true,
        unfurl_media: true
      });
      console.log('Successfully sent xcancel links');
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  } else {
    console.log('No x.com URLs found in message');
  }
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