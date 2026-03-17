import axios from "axios";

type CodeforcesSubmission = {
  creationTimeSeconds: number;
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
  };
};

type UserStatusResponse = {
  status: string;
  result: CodeforcesSubmission[];
};

type TrackerInput = {
  user1Handle: string;
  user2Handle: string;
  problemId: string;
  startedAt?: Date;
  pollIntervalMs?: number;
};

type TrackerResult = {
  winner: string | null;
  submissionTime: Date;
  isTie: boolean;
};

const CODEFORCES_API_BASE_URL = "https://codeforces.com/api";
const DEFAULT_POLL_INTERVAL_MS = 3000;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const buildProblemKey = (problem: { contestId?: number; index: string }) => {
  return `${problem.contestId ?? "unknown"}-${problem.index}`;
};

const fetchUserSubmissions = async (handle: string) => {
  const response = await axios.get<UserStatusResponse>(`${CODEFORCES_API_BASE_URL}/user.status`, {
    params: { handle }
  });

  if (response.data.status !== "OK") {
    throw new Error(`Failed to fetch submissions for handle ${handle}`);
  }

  return response.data.result;
};

const findEarliestAcceptedSubmission = ({
  submissions,
  problemId,
  startedAt
}: {
  submissions: CodeforcesSubmission[];
  problemId: string;
  startedAt?: Date;
}) => {
  const startedAtSeconds = startedAt ? Math.floor(startedAt.getTime() / 1000) : null;

  const acceptedSubmissions = submissions
    .filter((submission) => submission.verdict === "OK")
    .filter((submission) => buildProblemKey(submission.problem) === problemId)
    .filter((submission) =>
      startedAtSeconds === null ? true : submission.creationTimeSeconds >= startedAtSeconds
    )
    .sort((a, b) => a.creationTimeSeconds - b.creationTimeSeconds);

  return acceptedSubmissions[0] ?? null;
};

const resolveTrackerResult = ({
  user1Handle,
  user2Handle,
  user1Accepted,
  user2Accepted
}: {
  user1Handle: string;
  user2Handle: string;
  user1Accepted: CodeforcesSubmission | null;
  user2Accepted: CodeforcesSubmission | null;
}): TrackerResult | null => {
  if (!user1Accepted && !user2Accepted) {
    return null;
  }

  if (user1Accepted && user2Accepted) {
    if (user1Accepted.creationTimeSeconds === user2Accepted.creationTimeSeconds) {
      return {
        winner: null,
        submissionTime: new Date(user1Accepted.creationTimeSeconds * 1000),
        isTie: true
      };
    }

    const winnerSubmission =
      user1Accepted.creationTimeSeconds < user2Accepted.creationTimeSeconds
        ? { handle: user1Handle, submission: user1Accepted }
        : { handle: user2Handle, submission: user2Accepted };

    return {
      winner: winnerSubmission.handle,
      submissionTime: new Date(winnerSubmission.submission.creationTimeSeconds * 1000),
      isTie: false
    };
  }

  const winningSubmission = user1Accepted
    ? { handle: user1Handle, submission: user1Accepted }
    : { handle: user2Handle, submission: user2Accepted as CodeforcesSubmission };

  return {
    winner: winningSubmission.handle,
    submissionTime: new Date(winningSubmission.submission.creationTimeSeconds * 1000),
    isTie: false
  };
};

export const trackFirstAcceptedSubmission = async ({
  user1Handle,
  user2Handle,
  problemId,
  startedAt,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS
}: TrackerInput): Promise<TrackerResult> => {
  while (true) {
    const [user1Submissions, user2Submissions] = await Promise.all([
      fetchUserSubmissions(user1Handle),
      fetchUserSubmissions(user2Handle)
    ]);

    const user1Accepted = findEarliestAcceptedSubmission({
      submissions: user1Submissions,
      problemId,
      startedAt
    });

    const user2Accepted = findEarliestAcceptedSubmission({
      submissions: user2Submissions,
      problemId,
      startedAt
    });

    const result = resolveTrackerResult({
      user1Handle,
      user2Handle,
      user1Accepted,
      user2Accepted
    });

    if (result) {
      return result;
    }

    await delay(pollIntervalMs);
  }
};
