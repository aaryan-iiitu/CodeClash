import axios from "axios";

type RatingRange = {
  min: number;
  max: number;
};

type CodeforcesProblem = {
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
};

type ProblemsetResponse = {
  status: string;
  result: {
    problems: CodeforcesProblem[];
  };
};

type UserStatusSubmission = {
  verdict?: string;
  problem: {
    contestId?: number;
    index: string;
  };
};

type UserStatusResponse = {
  status: string;
  result: UserStatusSubmission[];
};

const CODEFORCES_API_BASE_URL = "https://codeforces.com/api";

const buildProblemKey = (problem: { contestId?: number; index: string }) => {
  return `${problem.contestId ?? "unknown"}-${problem.index}`;
};

const fetchSolvedProblemKeys = async (handle: string) => {
  const response = await axios.get<UserStatusResponse>(`${CODEFORCES_API_BASE_URL}/user.status`, {
    params: { handle }
  });

  if (response.data.status !== "OK") {
    throw new Error(`Failed to fetch submissions for handle ${handle}`);
  }

  const solvedProblems = response.data.result.filter(
    (submission) => submission.verdict === "OK" && submission.problem?.index
  );

  return new Set(solvedProblems.map((submission) => buildProblemKey(submission.problem)));
};

const fetchProblemset = async () => {
  const response = await axios.get<ProblemsetResponse>(`${CODEFORCES_API_BASE_URL}/problemset.problems`);

  if (response.data.status !== "OK") {
    throw new Error("Failed to fetch Codeforces problemset");
  }

  return response.data.result.problems;
};

export const getRandomCodeforcesProblem = async ({
  user1Handle,
  user2Handle,
  ratingRange
}: {
  user1Handle: string;
  user2Handle: string;
  ratingRange: RatingRange;
}) => {
  const [problems, user1Solved, user2Solved] = await Promise.all([
    fetchProblemset(),
    fetchSolvedProblemKeys(user1Handle),
    fetchSolvedProblemKeys(user2Handle)
  ]);

  const commonSolvedProblems = new Set(
    [...user1Solved].filter((problemKey) => user2Solved.has(problemKey))
  );

  const filteredProblems = problems.filter((problem) => {
    if (typeof problem.rating !== "number") {
      return false;
    }

    const withinRatingRange =
      problem.rating >= ratingRange.min && problem.rating <= ratingRange.max;

    if (!withinRatingRange) {
      return false;
    }

    return !commonSolvedProblems.has(buildProblemKey(problem));
  });

  if (filteredProblems.length === 0) {
    throw new Error("No unsolved Codeforces problem found for the provided handles and rating range");
  }

  const randomIndex = Math.floor(Math.random() * filteredProblems.length);

  return filteredProblems[randomIndex];
};
