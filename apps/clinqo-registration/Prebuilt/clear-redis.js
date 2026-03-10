const redis = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// Connect to Redis
const redisClient = redis.createClient({
  socket: {
    host: 'localhost',
    port: 6379,
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

redisClient.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  process.exit(1);
});

redisClient.on('connect', () => {
  console.log('✅ Connected to Redis');
});

(async () => {
  try {
    await redisClient.connect();

    // Get all keys
    const keys = await redisClient.keys('*');
    console.log(`\n📊 Found ${keys.length} keys in Redis`);

    if (keys.length === 0) {
      console.log('✅ Redis is already empty!');
      await redisClient.disconnect();
      process.exit(0);
    }

    // Display keys that will be deleted
    console.log('\n🗑️  Keys to be deleted:');
    keys.forEach((key, index) => {
      console.log(`   ${index + 1}. ${key}`);
    });

    // Clear all data using FLUSHDB
    console.log('\n⏳ Clearing Redis database...');
    await redisClient.flushDb();

    console.log('✅ All Redis data has been cleared successfully!');
    console.log('🔄 Redis is now empty and ready for new data\n');

    await redisClient.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing Redis:', error);
    process.exit(1);
  }
})();
