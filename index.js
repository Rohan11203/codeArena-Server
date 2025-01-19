import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import { routes } from "./src/routes/index.js";
import { handleConnection } from "./src/webSocket/websocketHandlers.js";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies, etc.)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
  })
);

app.use(express.json());

app.use("/api", routes);

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", handleConnection);

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

main();
