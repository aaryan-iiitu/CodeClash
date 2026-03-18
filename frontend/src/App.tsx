import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import { SocketProvider } from "./socket/SocketProvider";

const STORAGE_KEY = "codeclash-user";

function App() {
  const [handle, setHandle] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY);

    if (!savedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser) as { handle?: string };
      if (parsedUser.handle) {
        setHandle(parsedUser.handle);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHandle(null);
  };

  return (
    <SocketProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar handle={handle} onLogout={onLogout} />
        {handle ? <DashboardPage handle={handle} /> : <AuthPage onAuthSuccess={setHandle} />}
      </div>
    </SocketProvider>
  );
}

export default App;
