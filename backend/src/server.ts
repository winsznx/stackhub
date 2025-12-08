import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config';
import { createRedisClient } from './services/realtime';
import sbtcRoutes from './routes/sbtc';

const app = express();
const httpServer = createServer(app);

// Setup Socket.IO with Redis Adapter
const pubClient = createRedisClient();
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
    console.log('Redis Pub/Sub connected');
}).catch(err => {
    console.error('Redis Pub/Sub connection failed:', err);
});

const io = new Server(httpServer, {
    cors: {
        origin: env.FRONTEND_URL,
        methods: ["GET", "POST"]
    },
    adapter: createAdapter(pubClient, subClient)
});

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', env: env.NODE_ENV });
});

// API Routes
app.use('/api/sbtc', sbtcRoutes);

// WebSocket connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_chat', (conversationId) => {
        socket.join(conversationId);
        console.log(`User ${socket.id} joined chat ${conversationId}`);
    });

    socket.on('send_message', (data) => {
        // Broadcast to room
        io.to(data.conversationId).emit('new_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
});
