import axios from "axios";
import { useEffect, useState } from "react";

type LeaderboardUser = {
  _id: string;
  handle: string;
  rating: number;
  wins: number;
  matchesPlayed: number;
};

type LeaderboardPageProps = {
  onBack: () => void;
};

const LeaderboardPage = ({ onBack }: LeaderboardPageProps) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await axios.get<LeaderboardUser[]>(
          "http://localhost:5000/api/users/leaderboard"
        );
        setUsers(response.data);
        setError(null);
      } catch {
        setError("Could not load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    void fetchLeaderboard();
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Leaderboard</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Top users</h1>
        </div>
        <button
          className="rounded-full border border-slate-700 px-5 py-3 font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-900"
          onClick={onBack}
          type="button"
        >
          Back to Dashboard
        </button>
      </div>

      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/80 shadow-2xl shadow-cyan-950/10">
        <div className="grid grid-cols-[80px_1.5fr_1fr_1fr] border-b border-slate-800 px-6 py-4 text-sm uppercase tracking-[0.2em] text-slate-400">
          <span>#</span>
          <span>User</span>
          <span>Rating</span>
          <span>Wins</span>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-slate-300">Loading leaderboard...</div>
        ) : error ? (
          <div className="px-6 py-10 text-rose-300">{error}</div>
        ) : users.length === 0 ? (
          <div className="px-6 py-10 text-slate-300">No users found.</div>
        ) : (
          users.map((user, index) => (
            <div
              className="grid grid-cols-[80px_1.5fr_1fr_1fr] items-center border-b border-slate-800/80 px-6 py-5 text-slate-200 last:border-b-0"
              key={user._id}
            >
              <span className="text-lg font-semibold text-white">{index + 1}</span>
              <div>
                <p className="font-medium text-white">@{user.handle}</p>
                <p className="text-sm text-slate-400">{user.matchesPlayed} matches played</p>
              </div>
              <span className="font-semibold text-cyan-300">{user.rating}</span>
              <span>{user.wins}</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default LeaderboardPage;
