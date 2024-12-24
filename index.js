import express from 'express';
import { mongoose, version } from 'mongoose';
import { routes } from './src/routes/index.js';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import axios from 'axios';
import { createServer } from 'http';
import { Socket } from 'dgram';
import { type } from 'os';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

dotenv.config();

app.use(express.json());
app.use("/api", routes);

wss.on('connection', (socket) => {
  console.log('new Client connected:');

  socket.on('message', (message) => {
    const data = JSON.parse(message.toString());
    if(data.type === 'join'){
      handleJoin(ws,data);
    }
    else if(data.type === 'chat'){
      handleChat(ws,data);
    }
    console.log('received message:', message);
  })
})

function handleJoin(ws,data){}
function handleChat(ws,data){}
async function main() {
  try {
    await mongoose.connect('mongodb+srv://rohanshikhare410:AQ8ZPGXLfg0OPUtl@cluster0.nk6up.mongodb.net/CodeArena');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
  server.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

main();
