import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { socket } from "./client";

type MatchUser = {
  userId: string;
  handle: string;
  rating: number;
  minRating: number;
  maxRating: number;
  joinedAt: string | Date;
};

type MatchFoundPayload = {
  roomId: string;
  matchId: string;
  startedAt: string;
  pair: {
    user1: MatchUser;
    user2: MatchUser;
  };
  problem: {
    problemId: string;
    name: string;
    rating?: number;
    index: string;
    contestId?: number;
    tags: string[];
  };
};

type MatchStartPayload = {
  roomId: string;
  matchId: string;
  startedAt: string;
};

type MatchResultPayload = {
  roomId: string;
  matchId: string;
  winner: string | null;
  winnerId?: string | null;
  submissionTime: string | null;
  isTie: boolean;
  error?: string;
};

type MatchState = {
  roomId: string | null;
  matchId: string | null;
  status: "idle" | "matched" | "started" | "finished";
  startedAt: string | null;
  problem: MatchFoundPayload["problem"] | null;
  pair: MatchFoundPayload["pair"] | null;
  result: MatchResultPayload | null;
};

type SocketContextValue = {
  connected: boolean;
  matchState: MatchState;
  resetMatchState: () => void;
};

const initialMatchState: MatchState = {
  roomId: null,
  matchId: null,
  status: "idle",
  startedAt: null,
  problem: null,
  pair: null,
  result: null
};

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const [connected, setConnected] = useState(socket.connected);
  const [matchState, setMatchState] = useState<MatchState>(initialMatchState);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMatchFound = (payload: MatchFoundPayload) => {
      setMatchState({
        roomId: payload.roomId,
        matchId: payload.matchId,
        status: "matched",
        startedAt: payload.startedAt,
        problem: payload.problem,
        pair: payload.pair,
        result: null
      });
    };

    const onStartMatch = (payload: MatchStartPayload) => {
      setMatchState((current) => ({
        ...current,
        roomId: payload.roomId,
        matchId: payload.matchId,
        startedAt: payload.startedAt,
        status: "started"
      }));
    };

    const onMatchResult = (payload: MatchResultPayload) => {
      setMatchState((current) => ({
        ...current,
        roomId: payload.roomId,
        matchId: payload.matchId,
        status: "finished",
        result: payload
      }));
    };

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("matchFound", onMatchFound);
    socket.on("startMatch", onStartMatch);
    socket.on("matchResult", onMatchResult);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("matchFound", onMatchFound);
      socket.off("startMatch", onStartMatch);
      socket.off("matchResult", onMatchResult);
    };
  }, []);

  const value = useMemo(
    () => ({
      connected,
      matchState,
      resetMatchState: () => setMatchState(initialMatchState)
    }),
    [connected, matchState]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }

  return context;
};
