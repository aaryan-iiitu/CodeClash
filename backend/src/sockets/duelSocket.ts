import { Server, Socket } from "socket.io";
import { addUserToQueue, findMatch } from "../services/matchmakingService";

type JoinQueuePayload = {
  userId: string;
  handle: string;
  rating: number;
  ratingRange: number;
};

type MatchRoom = {
  roomId: string;
  users: [string, string];
};

const userSocketMap = new Map<string, string>();
const activeMatchRooms = new Map<string, MatchRoom>();

const getRoomIdForUser = (userId: string) => {
  return activeMatchRooms.get(userId)?.roomId ?? null;
};

const attachUsersToRoom = (io: Server, roomId: string, userIds: string[]) => {
  userIds.forEach((userId) => {
    const socketId = userSocketMap.get(userId);

    if (socketId) {
      const targetSocket = io.sockets.sockets.get(socketId);
      targetSocket?.join(roomId);
    }
  });
};

const createMatchRoom = (userIds: [string, string]) => {
  const roomId = `match:${userIds[0]}:${userIds[1]}:${Date.now()}`;

  userIds.forEach((userId) => {
    activeMatchRooms.set(userId, { roomId, users: userIds });
  });

  return roomId;
};

const clearDisconnectedUser = (socket: Socket) => {
  for (const [userId, socketId] of userSocketMap.entries()) {
    if (socketId === socket.id) {
      userSocketMap.delete(userId);
      activeMatchRooms.delete(userId);
    }
  }
};

export const registerDuelSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinQueue", (payload: JoinQueuePayload) => {
      const queuedUser = addUserToQueue(payload);
      userSocketMap.set(payload.userId, socket.id);

      const matchedPair = findMatch(payload.userId);

      if (!matchedPair) {
        socket.emit("joinQueue", {
          status: "queued",
          user: queuedUser
        });
        return;
      }

      const roomUsers: [string, string] = [matchedPair.user1.userId, matchedPair.user2.userId];
      const roomId = createMatchRoom(roomUsers);

      attachUsersToRoom(io, roomId, roomUsers);

      const matchPayload = {
        roomId,
        pair: matchedPair
      };

      io.to(roomId).emit("matchFound", matchPayload);
      io.to(roomId).emit("startMatch", {
        roomId,
        users: matchedPair
      });
    });

    socket.on("startMatch", ({ roomId, ...payload }) => {
      socket.join(roomId);
      io.to(roomId).emit("startMatch", { roomId, ...payload });
    });

    socket.on("submissionUpdate", ({ roomId, ...payload }) => {
      io.to(roomId).emit("submissionUpdate", { roomId, ...payload });
    });

    socket.on("matchResult", ({ roomId, ...payload }) => {
      io.to(roomId).emit("matchResult", { roomId, ...payload });
    });

    socket.on("disconnect", () => {
      clearDisconnectedUser(socket);
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
