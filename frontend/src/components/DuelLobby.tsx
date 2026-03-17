import { useSocket } from "../hooks/useSocket";

const DuelLobby = () => {
  const socket = useSocket();

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
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Join Queue
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
            <p className="mt-1 text-base font-medium text-white">Axios setup can plug in here</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DuelLobby;
