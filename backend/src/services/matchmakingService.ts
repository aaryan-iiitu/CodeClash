export type QueueUser = {
  userId: string;
  handle: string;
  rating: number;
  minRating: number;
  maxRating: number;
  joinedAt: Date;
};

export type MatchedPair = {
  user1: QueueUser;
  user2: QueueUser;
};

const matchmakingQueue: QueueUser[] = [];

const isCompatibleMatch = (userA: QueueUser, userB: QueueUser) => {
  const userAWithinRange = userB.rating >= userA.minRating && userB.rating <= userA.maxRating;
  const userBWithinRange = userA.rating >= userB.minRating && userA.rating <= userB.maxRating;

  return userAWithinRange && userBWithinRange;
};

export const addUserToQueue = ({
  userId,
  handle,
  rating,
  ratingRange
}: {
  userId: string;
  handle: string;
  rating: number;
  ratingRange: number;
}) => {
  const existingIndex = matchmakingQueue.findIndex((queuedUser) => queuedUser.userId === userId);

  if (existingIndex !== -1) {
    matchmakingQueue.splice(existingIndex, 1);
  }

  const queuedUser: QueueUser = {
    userId,
    handle,
    rating,
    minRating: rating - ratingRange,
    maxRating: rating + ratingRange,
    joinedAt: new Date()
  };

  matchmakingQueue.push(queuedUser);

  return queuedUser;
};

export const findMatch = (userId: string): MatchedPair | null => {
  const userIndex = matchmakingQueue.findIndex((queuedUser) => queuedUser.userId === userId);

  if (userIndex === -1) {
    return null;
  }

  const currentUser = matchmakingQueue[userIndex];

  const opponentIndex = matchmakingQueue.findIndex(
    (queuedUser, index) => index !== userIndex && isCompatibleMatch(currentUser, queuedUser)
  );

  if (opponentIndex === -1) {
    return null;
  }

  const opponent = matchmakingQueue[opponentIndex];
  const matchedUsers = [currentUser, opponent].sort(
    (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime()
  );

  const indexesToRemove = [userIndex, opponentIndex].sort((a, b) => b - a);
  indexesToRemove.forEach((index) => {
    matchmakingQueue.splice(index, 1);
  });

  return {
    user1: matchedUsers[0],
    user2: matchedUsers[1]
  };
};

export const getQueueSnapshot = () => {
  return [...matchmakingQueue];
};
