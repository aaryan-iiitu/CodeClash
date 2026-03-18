import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
  ratings?: {
    winner: {
      id: string;
      handle: string;
      rating: number;
      matchesPlayed: number;
      wins: number;
    };
    loser: {
      id: string;
      handle: string;
      rating: number;
      matchesPlayed: number;
      wins: number;
    };
  } | null;
};

type SubmissionUpdatePayload = {
  roomId: string;
  matchId: string;
  user1HasSubmitted: boolean;
  user2HasSubmitted: boolean;
  user1AcceptedTime: string | null;
  user2AcceptedTime: string | null;
};

type MatchState = {
  roomId: string | null;
  matchId: string | null;
  status: "idle" | "matched" | "started" | "finished";
  startedAt: string | null;
  problem: MatchFoundPayload["problem"] | null;
  pair: MatchFoundPayload["pair"] | null;
  submissionUpdate: SubmissionUpdatePayload | null;
  result: MatchResultPayload | null;
};

type SocketContextValue = {
  connected: boolean;
  matchState: MatchState;
  popupMessage: string | null;
  queueMessage: string;
  queueStatus: "idle" | "joining" | "queued" | "matched" | "error";
  joinQueue: (input: { handle: string; ratingRange: number }) => void;
  resetMatchState: () => void;
};

const initialMatchState: MatchState = {
  roomId: null,
  matchId: null,
  status: "idle",
  startedAt: null,
  problem: null,
  pair: null,
  submissionUpdate: null,
  result: null
};

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider = ({ children }: PropsWithChildren) => {
  const [connected, setConnected] = useState(socket.connected);
  const [matchState, setMatchState] = useState<MatchState>(initialMatchState);
  const [queueStatus, setQueueStatus] = useState<"idle" | "joining" | "queued" | "matched" | "error">("idle");
  const [queueMessage, setQueueMessage] = useState("Idle");
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const openedProblemMatchIdRef = useRef<string | null>(null);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => {
      setConnected(false);
      setQueueStatus("error");
      setQueueMessage("Socket disconnected. Reconnect and try again.");
    };
    const onConnectError = () => {
      setQueueStatus("error");
      setQueueMessage("Could not connect to realtime server.");
    };

    const onQueueJoined = (payload: {
      status: "queued";
      user: { minRating: number; maxRating: number };
    }) => {
      setQueueStatus("queued");
      setQueueMessage(
        `Queued for ${payload.user.minRating} to ${payload.user.maxRating} rating range`
      );
    };

    const onMatchFound = (payload: MatchFoundPayload) => {
      setQueueStatus("matched");
      setQueueMessage(`Match found: ${payload.pair.user1.handle} vs ${payload.pair.user2.handle}`);
      setPopupMessage(null);
      setMatchState({
        roomId: payload.roomId,
        matchId: payload.matchId,
        status: "matched",
        startedAt: payload.startedAt,
        problem: payload.problem,
        pair: payload.pair,
        submissionUpdate: null,
        result: null
      });
    };

    const onStartMatch = (payload: MatchStartPayload) => {
      setMatchState((current) => {
        const hasProblemLink = current.problem?.contestId && current.problem.index;

        if (
          current.matchId === payload.matchId &&
          hasProblemLink &&
          openedProblemMatchIdRef.current !== payload.matchId
        ) {
          openedProblemMatchIdRef.current = payload.matchId;
          const newWindow = window.open(
            `https://codeforces.com/problemset/problem/${current.problem?.contestId}/${current.problem?.index}`,
            "_blank",
            "noopener,noreferrer"
          );

          setPopupMessage(
            newWindow
              ? null
              : "Browser blocked the problem tab. Use the Open Problem button below."
          );
        }

        return {
          ...current,
          roomId: payload.roomId,
          matchId: payload.matchId,
          startedAt: payload.startedAt,
          status: "started"
        };
      });
    };

    const onSubmissionUpdate = (payload: SubmissionUpdatePayload) => {
      setMatchState((current) => ({
        ...current,
        roomId: payload.roomId,
        matchId: payload.matchId,
        submissionUpdate: payload
      }));
    };

    const onMatchResult = (payload: MatchResultPayload) => {
      setQueueStatus(payload.error ? "error" : "matched");
      if (payload.error) {
        setQueueMessage(payload.error);
      }
      setMatchState((current) => ({
        ...current,
        roomId: payload.roomId,
        matchId: payload.matchId,
        status: "finished",
        result: payload
      }));
    };

    const onQueueError = (payload: { message: string }) => {
      setQueueStatus("error");
      setQueueMessage(payload.message);
    };

    socket.connect();
    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.on("disconnect", onDisconnect);
    socket.on("joinQueue", onQueueJoined);
    socket.on("queueError", onQueueError);
    socket.on("matchFound", onMatchFound);
    socket.on("startMatch", onStartMatch);
    socket.on("submissionUpdate", onSubmissionUpdate);
    socket.on("matchResult", onMatchResult);

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.off("disconnect", onDisconnect);
      socket.off("joinQueue", onQueueJoined);
      socket.off("queueError", onQueueError);
      socket.off("matchFound", onMatchFound);
      socket.off("startMatch", onStartMatch);
      socket.off("submissionUpdate", onSubmissionUpdate);
      socket.off("matchResult", onMatchResult);
    };
  }, []);

  const value = useMemo(
    () => ({
      connected,
      matchState,
      popupMessage,
      queueMessage,
      queueStatus,
      joinQueue: ({ handle, ratingRange }) => {
        setQueueStatus("joining");
        setQueueMessage("Joining queue...");
        setPopupMessage(null);
        socket.emit("joinQueue", {
          handle,
          ratingRange
        });
      },
      resetMatchState: () => {
        openedProblemMatchIdRef.current = null;
        setQueueStatus("idle");
        setQueueMessage("Idle");
        setPopupMessage(null);
        setMatchState(initialMatchState);
      }
    }),
    [connected, matchState, popupMessage, queueMessage, queueStatus]
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
