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
const xUrlRegex = /https?:\/\/((?:www\.)?(?:twitter\.com|x\.com))\/[^\s<>]+/gi;

// Function to convert x.com URLs to xcancel.com URLs
function convertToXcancel(url) {
  // Clean up any trailing characters that might have been captured
  url = url.replace(/[<>]+$/, '');
  return url.replace(/(?:twitter\.com|x\.com)/i, 'xcancel.com');
}

// Listen for the bot being added to a channel
app.event('member_joined_channel', async ({ event, client }) => {
  // Check if the member that joined is our bot
  const authTest = await client.auth.test();
  if (event.user === authTest.user_id) {
    try {
      await client.chat.postMessage({
        channel: event.channel,
        text: "👋 Hey! I'm going to post links to xcancel.com when I see x.com links in chat.."
      });
    } catch (error) {
      console.error('Error sending welcome message:', error.message);
    }
  }
});

// Listen for message events
app.event('message', async ({ event, client }) => {
  // Only process messages with text
  if (!event.text) return;

  // Check for x.com URLs
  const matches = event.text.match(xUrlRegex);
  if (matches) {
    const xcancelLinks = matches.map(url => convertToXcancel(url));
    
    try {
      await client.chat.postMessage({
        channel: event.channel,
        text: `Use xcancel instead:\n${xcancelLinks.join('\n')}`,
        unfurl_links: true,
        unfurl_media: true
      });
    } catch (error) {
      console.error('Error sending reply:', error.message);
    }
  }
});

// Start the app
(async () => {
  try {
    await app.start();
    console.log('🚀 XCancel bot is running!');
  } catch (error) {
    console.error('Failed to start app:', error.message);
    process.exit(1);
  }
})(); 