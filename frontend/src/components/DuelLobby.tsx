import { useSocket } from "../hooks/useSocket";

const DuelLobby = () => {
  const socket = useSocket();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>CodeClash</h1>
      <p>Real-time coding duels with React, Vite, and Socket.IO.</p>
      <p>Socket status: {socket.connected ? "connected" : "connecting..."}</p>
    </main>
  );
};

export default DuelLobby;
