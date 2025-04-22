import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const client = createClient({ url: redisUrl });

client.on('error', (err) => console.error('Redis Client Error', err));

export async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
  }
}

export async function storeMessageInRedis(key: string, message: string) {
  await connectRedis();
  await client.set(key, message);
}

export async function getMessageFromRedis(key: string): Promise<string | null> {
  await connectRedis();
  return client.get(key);
}

export async function disconnectRedis() {
  if (client.isOpen) {
    await client.quit();
  }
}
