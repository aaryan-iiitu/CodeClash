import axios from "axios";
import { useState } from "react";
import { useSocket } from "../hooks/useSocket";

type DuelLobbyProps = {
  handle: string;
};

const DuelLobby = ({ handle }: DuelLobbyProps) => {
  const socket = useSocket();
  const [ratingRange, setRatingRange] = useState(200);
  const [queueStatus, setQueueStatus] = useState("Idle");
  const [isLoading, setIsLoading] = useState(false);

  const joinQueue = async () => {
    try {
      setIsLoading(true);
      setQueueStatus("Joining queue...");

      const response = await axios.post("http://localhost:5000/api/matchmaking/join", {
        handle,
        ratingRange
      });

      const data = response.data as
        | { status: "queued"; user: { minRating: number; maxRating: number } }
        | { status: "matched"; pair: { user1: { handle: string }; user2: { handle: string } } };

      if (data.status === "matched") {
        setQueueStatus(
          `Match found: ${data.pair.user1.handle} vs ${data.pair.user2.handle}`
        );
        return;
      }

      setQueueStatus(
        `Queued for ${data.user.minRating} to ${data.user.maxRating} rating range`
      );
    } catch (error) {
      setQueueStatus("Could not join queue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr]">
      <section className="space-y-6">
        <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
          Real-time coding duels
        </span>
        <div className="space-y-4">
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Compete live, solve faster, and climb the duel ladder.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            CodeClash pairs developers with evenly matched opponents, fetches a problem in
            range, and tracks the winner live through Socket.IO.
          </p>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-200">
            Logged in as {handle}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2">
            <label className="text-sm font-medium text-slate-300" htmlFor="ratingRange">
              Rating range
            </label>
            <select
              className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white outline-none"
              id="ratingRange"
              onChange={(event) => setRatingRange(Number(event.target.value))}
              value={ratingRange}
            >
              <option value={100}>+/- 100</option>
              <option value={200}>+/- 200</option>
              <option value={300}>+/- 300</option>
              <option value={500}>+/- 500</option>
            </select>
          </div>
          <button
            className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-700"
            disabled={isLoading}
            onClick={joinQueue}
            type="button"
          >
            {isLoading ? "Finding..." : "Find Match"}
          </button>
          <button className="rounded-full border border-slate-700 px-6 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900">
            View Leaderboard
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Match Status</h2>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              socket.connected
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {socket.connected ? "Connected" : "Connecting"}
          </span>
        </div>

        <div className="mt-6 space-y-4 text-sm text-slate-300">
          <div className="rounded-2xl bg-slate-950/70 p-4">
            <p className="text-slate-400">Frontend</p>
            <p className="mt-1 text-base font-medium text-white">React + Vite + TypeScript</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-4">
            <p className="text-slate-400">Realtime</p>
            <p className="mt-1 text-base font-medium text-white">Socket.IO client ready</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-4">
            <p className="text-slate-400">API</p>
            <p className="mt-1 text-base font-medium text-white">{queueStatus}</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DuelLobby;
