import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import {routes} from './src/routes/index.js';
import { handleConnection } from './src/webSocket/websocketHandlers.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api', routes);

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', handleConnection);

async function main() {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

main();
