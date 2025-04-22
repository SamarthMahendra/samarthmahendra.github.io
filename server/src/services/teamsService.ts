import { ConfidentialClientApplication } from '@azure/msal-node';
import axios from 'axios';

const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID!,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET!,
  },
};

const cca = new ConfidentialClientApplication(msalConfig);

export async function getAccessToken(): Promise<string> {
  const result = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });
  return result.accessToken!;
}

export async function getUserId(token: string): Promise<string> {
  const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return userResponse.data.id;
}

export async function createChatWithSelf(token: string, userId: string): Promise<string> {
  const chatResponse = await axios.post(
    'https://graph.microsoft.com/v1.0/chats',
    {
      chatType: 'oneOnOne',
      members: [
        {
          '@odata.type': '#microsoft.graph.aadUserConversationMember',
          roles: ['owner'],
          'user@odata.bind': `https://graph.microsoft.com/v1.0/users('${userId}')`,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return chatResponse.data.id;
}

export async function sendMessageToSelf(message: string): Promise<void> {
  const token = await getAccessToken();
  const userId = await getUserId(token);
  const chatId = await createChatWithSelf(token, userId);
  await axios.post(
    `https://graph.microsoft.com/v1.0/chats/${chatId}/messages`,
    {
      body: { content: message },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
}

export async function getLatestMessagesFromChat(chatId: string, token: string) {
  const response = await axios.get(
    `https://graph.microsoft.com/v1.0/chats/${chatId}/messages`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data.value;
}
