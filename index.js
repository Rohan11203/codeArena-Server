import express from 'express';
import { mongoose, version } from 'mongoose';
import { routes } from './src/routes/index.js';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import axios from 'axios';

const wss = new WebSocketServer({ port: 8000 });

dotenv.config();
const app = express();


app.use(express.json());
app.use("/api", routes);

let connectionId = 0;
wss.on('connection', (socket) => {
  // Assign a unique ID to each connection
  // socket.id = ++connectionId;
  console.log('Client connected:', socket);

  socket.on('message', async (message) => {
    try {
      const data = JSON.parse(message); // Parse the received data
      console.log('Received code submission:', data);

      const { code, language } = data;

      // payload for Piston API
      const pistonPayload = {
        language: language || 'python',
        version: '*',
        files: [{ name: 'main', content: code }],
      };

      console.log("Before Piston API")
     
      const response = await axios.post(
        'https://emkc.org/api/v2/piston/execute',
        pistonPayload
      );

      console.log("After Piston API")
      // Send the execution result back to the client
      socket.send(JSON.stringify({ type: 'executionResult', result: response.data }));
      console.log(response.data.run.output);
    } catch (error) {
      if (error.response) {
        console.error('Piston API Error:', error.response.data);
      } else {
        console.error('Error executing code:', error.message);
      }
      socket.send(JSON.stringify({ type: 'executionError', error: error.message }));
    }
  });

  // Handle disconnections
  socket.on('close', () => {
    console.log('Client disconnected:', socket.id);
  });
});

async function main() {
  try {
    await mongoose.connect('mongodb+srv://rohanshikhare410:AQ8ZPGXLfg0OPUtl@cluster0.nk6up.mongodb.net/CodeArena');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
}

main();
