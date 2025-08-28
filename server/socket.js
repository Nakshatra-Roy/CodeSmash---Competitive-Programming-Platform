import { Server } from "socket.io";

export const userSockets = new Map();

export function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId;

    if (userId) {
      socket.join(userId.toString());

      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      console.log(`✅ User ${userId} connected to room ${userId}`);
    }

    socket.on("disconnect", () => {
      if (userId && userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
        }
      }
      console.log(`❌ User ${userId} disconnected`);
    });
  });

  return io;
}