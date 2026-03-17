import { Server } from "socket.io";

export const registerDuelSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("duel:join", (roomId: string) => {
      socket.join(roomId);
      io.to(roomId).emit("duel:message", `${socket.id} joined ${roomId}`);
    });

    socket.on("duel:code-update", ({ roomId, code }) => {
      socket.to(roomId).emit("duel:code-update", code);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};
