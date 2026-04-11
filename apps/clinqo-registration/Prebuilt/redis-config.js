const redis = require('redis');

const redisUrl = process.env.REDIS_URL;
const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = Number(process.env.REDIS_PORT || 6379);

const redisClient = redisUrl
  ? redis.createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    })
  : redis.createClient({
      socket: {
        host: redisHost,
        port: redisPort,
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
  if (redisUrl) {
    console.log('✅ Connected to Redis via REDIS_URL');
  } else {
    console.log(`✅ Connected to Redis on ${redisHost}:${redisPort}`);
  }
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

// Ensure connection is established
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
  }
})();

module.exports = redisClient;
