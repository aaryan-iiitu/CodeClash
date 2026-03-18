import axios from "axios";
import { FormEvent, useState } from "react";
import { API_BASE_URL } from "../config/env";

type AuthMode = "login" | "register";

type AuthPageProps = {
  onAuthSuccess: (handle: string) => void;
};

const AuthPage = ({ onAuthSuccess }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLabel = mode === "login" ? "Login" : "Register";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedHandle = handle.trim();

    if (!trimmedHandle) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const endpoint =
        mode === "login"
          ? `${API_BASE_URL}/api/users/login`
          : `${API_BASE_URL}/api/users/register`;

      const response = await axios.post(endpoint, {
        handle: trimmedHandle
      });

      const user = response.data.user as { id: string; handle: string; rating: number };

      localStorage.setItem("codeclash-user", JSON.stringify(user));
      onAuthSuccess(user.handle);
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        setError(requestError.response?.data?.message ?? "Authentication failed");
      } else {
        setError("Authentication failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-6 py-12">
      <main className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-6">
          <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-sm font-medium text-cyan-200">
            Welcome to CodeClash
          </span>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Sign in with your Codeforces handle and jump into a duel.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              We keep the first step intentionally simple so you can save your handle locally,
              enter the queue, and start testing the live match flow quickly.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex rounded-full bg-slate-950 p-1">
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="handle">
                Codeforces handle
              </label>
              <input
                id="handle"
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
                onChange={(event) => setHandle(event.target.value)}
                placeholder="tourist"
                type="text"
                value={handle}
              />
            </div>

            <button
              className="w-full rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-700"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? `${submitLabel}...` : submitLabel}
            </button>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          </form>
        </section>
      </main>
    </div>
  );
};

export default AuthPage;
