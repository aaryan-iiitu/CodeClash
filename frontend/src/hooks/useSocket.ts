import { useSocketContext } from "../socket/SocketProvider";

export const useSocket = () => {
  return useSocketContext();
};
