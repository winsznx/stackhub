import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    stxAddress: text('stx_address').notNull().unique(),
    btcName: text('btc_name'),
    reputationScore: integer('reputation_score').default(0),
    createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
    id: serial('id').primaryKey(),
    conversationId: text('conversation_id').notNull(),
    senderAddress: text('sender_address').notNull(),
    content: text('content').notNull(), // Encrypted blob reference or text
    isEncrypted: boolean('is_encrypted').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});
