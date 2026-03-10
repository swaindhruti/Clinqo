const ngrok = require('ngrok');
const dotenv = require('dotenv');

dotenv.config();

(async () => {
  try {
    // Set auth token
    if (process.env.NGROK_AUTHTOKEN) {
      await ngrok.authtoken(process.env.NGROK_AUTHTOKEN);
      console.log('✅ Ngrok authtoken set');
    }

    // Connect
    const url = await ngrok.connect(3000);
    console.log(`\n🌐 Ngrok Public URL: ${url}`);
    console.log(`📍 Webhook URL: ${url}/webhook`);
    console.log('\nNgrok tunnel is active. Press Ctrl+C to stop.\n');

    // Handle cleanup on exit
    process.on('SIGINT', async () => {
      console.log('\nClosing ngrok connection...');
      await ngrok.disconnect();
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
