import { db } from '../db';
import { messages } from '../db/schema';
import { eq, asc } from 'drizzle-orm';

export const saveMessage = async (data: { conversationId: string, senderAddress: string, content: string, isEncrypted: boolean }) => {
    const [saved] = await db.insert(messages).values({
        conversationId: data.conversationId,
        senderAddress: data.senderAddress,
        content: data.content,
        isEncrypted: data.isEncrypted || false
    }).returning();
    return saved;
};

export const getMessages = async (conversationId: string) => {
    return await db.select().from(messages)
        .where(eq(messages.conversationId, conversationId))
        .orderBy(asc(messages.createdAt));
};
