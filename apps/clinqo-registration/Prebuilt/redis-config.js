const redis = require('redis');

// Connect to Redis container
// Using docker bridge IP or localhost:6379
const redisClient = redis.createClient({
  socket: {
    host: 'localhost',  // Docker maps port 6379 to localhost
    port: 6379,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis on localhost:6379');
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
