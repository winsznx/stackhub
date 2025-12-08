import { Router } from 'express';
import { getMessages } from '../services/chat';

const router = Router();

// GET /api/chat/:conversationId/messages
router.get('/:conversationId/messages', async (req, res) => {
    try {
        const { conversationId } = req.params;
        const history = await getMessages(conversationId);
        res.json(history);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

export default router;
