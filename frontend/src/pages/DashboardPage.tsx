import { useState } from "react";
import DuelLobby from "../components/DuelLobby";
import LeaderboardPage from "./LeaderboardPage";

type DashboardPageProps = {
  handle: string;
};

const DashboardPage = ({ handle }: DashboardPageProps) => {
  const [view, setView] = useState<"dashboard" | "leaderboard">("dashboard");

  if (view === "leaderboard") {
    return <LeaderboardPage onBack={() => setView("dashboard")} />;
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-12">
      <DuelLobby handle={handle} onOpenLeaderboard={() => setView("leaderboard")} />
    </div>
  );
};

export default DashboardPage;
