import { Server, Socket } from "socket.io";
import { Match } from "../models/Match";
import { User } from "../models/User";
import { buildProblemKey, getRandomCodeforcesProblem } from "../services/codeforcesService";
import { addUserToQueue, findMatch, MatchedPair } from "../services/matchmakingService";
import { updateRating } from "../services/ratingService";
import { trackFirstAcceptedSubmission } from "../services/submissionTrackerService";

type JoinQueuePayload = {
  userId?: string;
  handle: string;
  ratingRange: number;
};

type MatchRoom = {
  roomId: string;
  users: [string, string];
  matchId: string;
};

const userSocketMap = new Map<string, string>();
const activeMatchRooms = new Map<string, MatchRoom>();

const emitToUsers = (io: Server, userIds: string[], event: string, payload: unknown) => {
  userIds.forEach((userId) => {
    const socketId = userSocketMap.get(userId);

    if (socketId) {
      io.to(socketId).emit(event, payload);
    }
  });
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

const createMatchRoom = (userIds: [string, string], matchId: string) => {
  const roomId = `match:${userIds[0]}:${userIds[1]}:${Date.now()}`;

  userIds.forEach((userId) => {
    activeMatchRooms.set(userId, { roomId, users: userIds, matchId });
  });

  return roomId;
};

const clearMatchRoom = (userIds: string[]) => {
  userIds.forEach((userId) => {
    activeMatchRooms.delete(userId);
  });
};

const clearDisconnectedUser = (socket: Socket) => {
  for (const [userId, socketId] of userSocketMap.entries()) {
    if (socketId === socket.id) {
      userSocketMap.delete(userId);
      activeMatchRooms.delete(userId);
    }
  }
};

const startTrackedMatch = async ({
  io,
  matchedPair
}: {
  io: Server;
  matchedPair: MatchedPair;
}) => {
  const selectedProblem = await getRandomCodeforcesProblem({
    user1Handle: matchedPair.user1.handle,
    user2Handle: matchedPair.user2.handle,
    ratingRange: {
      min: Math.min(matchedPair.user1.minRating, matchedPair.user2.minRating),
      max: Math.max(matchedPair.user1.maxRating, matchedPair.user2.maxRating)
    }
  });

  const startedAt = new Date();
  const problemId = buildProblemKey(selectedProblem);
  const averageRating = Math.round((matchedPair.user1.rating + matchedPair.user2.rating) / 2);

  const match = await Match.create({
    user1: matchedPair.user1.userId,
    user2: matchedPair.user2.userId,
    problemId,
    rating: selectedProblem.rating ?? averageRating,
    status: "ongoing",
    startTime: startedAt
  });

  const roomUsers: [string, string] = [matchedPair.user1.userId, matchedPair.user2.userId];
  const roomId = createMatchRoom(roomUsers, String(match._id));
  attachUsersToRoom(io, roomId, roomUsers);

  const matchDetails = {
    roomId,
    matchId: String(match._id),
    startedAt,
    pair: matchedPair,
    problem: {
      ...selectedProblem,
      problemId
    }
  };

  io.to(roomId).emit("matchFound", matchDetails);
  io.to(roomId).emit("startMatch", {
    roomId,
    matchId: String(match._id),
    startedAt
  });

  void trackFirstAcceptedSubmission({
    user1Handle: matchedPair.user1.handle,
    user2Handle: matchedPair.user2.handle,
    problemId,
    startedAt,
    onUpdate: (snapshot) => {
      io.to(roomId).emit("submissionUpdate", {
        roomId,
        matchId: String(match._id),
        ...snapshot
      });
    }
  })
    .then(async (result) => {
      const winnerId =
        result.winner === matchedPair.user1.handle
          ? matchedPair.user1.userId
          : result.winner === matchedPair.user2.handle
            ? matchedPair.user2.userId
            : null;

      const loserId =
        winnerId === matchedPair.user1.userId
          ? matchedPair.user2.userId
          : winnerId === matchedPair.user2.userId
            ? matchedPair.user1.userId
            : null;

      const ratingUpdate =
        winnerId && loserId ? await updateRating(winnerId, loserId) : null;

      await Match.findByIdAndUpdate(match._id, {
        status: "finished",
        winner: winnerId,
        endTime: result.submissionTime
      });

      io.to(roomId).emit("matchResult", {
        roomId,
        matchId: String(match._id),
        winner: result.winner,
        winnerId,
        submissionTime: result.submissionTime,
        isTie: result.isTie,
        ratings: ratingUpdate
      });

      clearMatchRoom(roomUsers);
    })
    .catch((error) => {
      io.to(roomId).emit("matchResult", {
        roomId,
        matchId: String(match._id),
        winner: null,
        submissionTime: null,
        isTie: false,
        error: error instanceof Error ? error.message : "Failed to track submissions"
      });

      clearMatchRoom(roomUsers);
    });
};

export const registerDuelSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("joinQueue", async (payload: JoinQueuePayload) => {
      let user = payload.userId ? await User.findById(payload.userId) : null;

      if (!user) {
        user = await User.findOne({ handle: payload.handle });
      }

      if (!user) {
        user = await User.create({
          handle: payload.handle,
          password: `local-${payload.handle}`
        });
      }

      const queuedUser = addUserToQueue({
        userId: String(user._id),
        handle: user.handle,
        rating: user.rating,
        ratingRange: payload.ratingRange
      });

      userSocketMap.set(String(user._id), socket.id);

      const matchedPair = findMatch(String(user._id));

      if (!matchedPair) {
        socket.emit("joinQueue", {
          status: "queued",
          user: queuedUser
        });
        return;
      }

      try {
        await startTrackedMatch({ io, matchedPair });
      } catch (error) {
        emitToUsers(io, [matchedPair.user1.userId, matchedPair.user2.userId], "queueError", {
          message: error instanceof Error ? error.message : "Failed to start match"
        });
      }
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
