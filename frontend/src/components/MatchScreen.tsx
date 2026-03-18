import { useEffect, useMemo, useState } from "react";
import { useSocket } from "../hooks/useSocket";

type MatchScreenProps = {
  handle: string;
};

const MATCH_DURATION_MS = 30 * 60 * 1000;

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const MatchScreen = ({ handle }: MatchScreenProps) => {
  const { matchState } = useSocket();
  const [timeLeft, setTimeLeft] = useState(MATCH_DURATION_MS);

  const opponent = useMemo(() => {
    if (!matchState.pair) {
      return null;
    }

    return matchState.pair.user1.handle === handle
      ? matchState.pair.user2
      : matchState.pair.user1;
  }, [handle, matchState.pair]);

  const playerSlot = useMemo(() => {
    if (!matchState.pair) {
      return null;
    }

    return matchState.pair.user1.handle === handle ? "user1" : "user2";
  }, [handle, matchState.pair]);

  useEffect(() => {
    if (!matchState.startedAt || matchState.status === "finished") {
      return;
    }

    const tick = () => {
      const endsAt = new Date(matchState.startedAt as string).getTime() + MATCH_DURATION_MS;
      setTimeLeft(endsAt - Date.now());
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [matchState.startedAt, matchState.status]);

  if (!matchState.problem || !opponent) {
    return null;
  }

  const contestId = matchState.problem.contestId;
  const problemIndex = matchState.problem.index;
  const problemLink =
    contestId && problemIndex
      ? `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`
      : "#";

  const statusLabel =
    matchState.status === "matched"
      ? "waiting"
      : matchState.status === "started"
        ? "ongoing"
        : "finished";

  const opponentSubmitted =
    playerSlot === "user1"
      ? matchState.submissionUpdate?.user2HasSubmitted
      : matchState.submissionUpdate?.user1HasSubmitted;

  const opponentSolved =
    playerSlot === "user1"
      ? matchState.submissionUpdate?.user2AcceptedTime
      : matchState.submissionUpdate?.user1AcceptedTime;

  return (
    <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Match Arena</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">You vs @{opponent.handle}</h2>
        </div>
        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            statusLabel === "waiting"
              ? "bg-amber-400/15 text-amber-300"
              : statusLabel === "ongoing"
                ? "bg-emerald-400/15 text-emerald-300"
                : "bg-slate-700 text-slate-200"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-slate-950/80 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Problem</p>
          <h3 className="mt-3 text-2xl font-semibold text-white">{matchState.problem.name}</h3>
          <p className="mt-2 text-slate-300">
            Rating {matchState.problem.rating ?? "Unknown"} • {matchState.problem.problemId}
          </p>
          <a
            className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            href={problemLink}
            rel="noreferrer"
            target="_blank"
          >
            Open Problem
          </a>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Countdown</p>
            <p className="mt-3 text-5xl font-semibold text-white">
              {statusLabel === "finished" ? "00:00" : formatTime(timeLeft)}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Opponent Status</p>
            <p className="mt-3 text-lg text-slate-200">
              {opponentSolved
                ? "Opponent solved"
                : opponentSubmitted
                  ? "Opponent submitted"
                  : "Waiting for opponent activity"}
            </p>
          </div>

          <div className="rounded-3xl bg-slate-950/80 p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Result</p>
            <p className="mt-3 text-lg text-slate-200">
              {matchState.result
                ? matchState.result.isTie
                  ? "Tie game"
                  : `${matchState.result.winner} won the duel`
                : "Waiting for submissions"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MatchScreen;
