import { WebSocket } from 'ws';

// Store connected clients and rooms
const clients = new Map(); // Map<WebSocket, { username, roomId }>
const rooms = new Map(); // Map<roomId, Set<WebSocket>>

export function handleConnection(ws) {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        switch (data.type) {
            case 'join':
                handleJoinRoom(ws, data);
                break;
            case 'chat':
                handleChatMessage(ws, data);
                break;
            case 'leave':
                handleLeaveRoom(ws);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    });

    ws.on('close', () => {
        handleLeaveRoom(ws);
        clients.delete(ws);
    });
}

function handleJoinRoom(ws, data) {
    const { username, roomId } = data;
    console.log(`User ${username} joined room ${roomId}`);
    // Remove from previous room if already joined
    if (clients.has(ws)) {
        handleLeaveRoom(ws);
    }

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    const room = rooms.get(roomId);
    room.add(ws);
    clients.set(ws, { username, roomId });

    // Notify room of new user
    broadcastToRoom(roomId, {
        type: 'system',
        content: `${username} joined the room`,
        timestamp: new Date().toISOString(),
    });

    // Update room user list
    updateRoomUserList(roomId);
}

function handleLeaveRoom(ws) {
    const client = clients.get(ws);
    if (!client) return;

    const { username, roomId } = client;
    const room = rooms.get(roomId);

    if (room) {
        room.delete(ws);

        // If room is empty, delete it
        if (room.size === 0) {
            rooms.delete(roomId);
        } else {
            // Notify remaining users
            broadcastToRoom(roomId, {
                type: 'system',
                content: `${username} left the room`,
                timestamp: new Date().toISOString(),
            });
            updateRoomUserList(roomId);
        }
    }
}

function handleChatMessage(ws, data) {
    const client = clients.get(ws);
    if (!client) return;

    const { username, roomId } = client;

    broadcastToRoom(roomId, {
        type: 'chat',
        username,
        content: data.content,
        timestamp: new Date().toISOString(),
    });
}

function broadcastToRoom(roomId, message) {
    const room = rooms.get(roomId);
    if (!room) return;

    const messageStr = JSON.stringify(message);
    room.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

function updateRoomUserList(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;

    const users = Array.from(room)
        .map((ws) => clients.get(ws)?.username)
        .filter((username) => username !== undefined);

    broadcastToRoom(roomId, {
        type: 'userList',
        users,
    });
}
