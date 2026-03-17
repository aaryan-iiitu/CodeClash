const Navbar = () => {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/85 backdrop-blur">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400 font-bold text-slate-950">
            C
          </div>
          <div>
            <p className="text-lg font-semibold text-white">CodeClash</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Duel Platform</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
          <a className="transition hover:text-white" href="#features">
            Features
          </a>
          <a className="transition hover:text-white" href="#queue">
            Queue
          </a>
          <a className="transition hover:text-white" href="#leaderboard">
            Leaderboard
          </a>
        </div>

        <button className="rounded-full border border-cyan-400/40 px-5 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10">
          Sign In
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
