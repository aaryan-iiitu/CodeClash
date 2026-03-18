import DuelLobby from "../components/DuelLobby";

type HomePageProps = {
  handle: string;
};

const HomePage = ({ handle }: HomePageProps) => {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-12">
      <DuelLobby handle={handle} />
    </div>
  );
};

export default HomePage;
