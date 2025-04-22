import { sendMessageToSelf, getAccessToken, getUserId, createChatWithSelf, getLatestMessagesFromChat } from './teamsService';
import { storeMessageInRedis, getMessageFromRedis } from './redisService';

/**
 * Sends a Teams message to the owner for meeting approval, logs to Redis, and polls for a reply.
 * If approved, returns true. If declined, returns false.
 */
export async function requestMeetingApproval(meetingId: string, meetingInfo: string): Promise<'confirmed' | 'declined' | 'timeout'> {
  // Send Teams message
  const prompt = `Meeting request: ${meetingInfo}\nReply with 'confirm' or 'decline' for meeting ID: ${meetingId}`;
  await sendMessageToSelf(prompt);
  await storeMessageInRedis(`meeting:${meetingId}:request`, prompt);

  // Poll for reply (simple polling, 30s timeout, poll every 5s)
  const token = await getAccessToken();
  const userId = await getUserId(token);
  const chatId = await createChatWithSelf(token, userId);
  const start = Date.now();
  const timeoutMs = 30_000;
  const pollInterval = 5_000;
  let lastChecked = new Date();

  while (Date.now() - start < timeoutMs) {
    const messages = await getLatestMessagesFromChat(chatId, token);
    // Find a message after lastChecked that matches criteria
    const reply = messages.find((msg: any) => {
      const created = new Date(msg.createdDateTime);
      return created > lastChecked &&
        msg.body?.content?.toLowerCase().includes(meetingId.toLowerCase());
    });
    if (reply) {
      const content = reply.body.content.toLowerCase();
      await storeMessageInRedis(`meeting:${meetingId}:response`, content);
      if (content.includes('confirm')) return 'confirmed';
      if (content.includes('decline')) return 'declined';
    }
    await new Promise(res => setTimeout(res, pollInterval));
    lastChecked = new Date();
  }
  return 'timeout';
}
