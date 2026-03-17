import { User } from "../models/User";

const K_FACTOR = 32;

const getExpectedScore = (playerRating: number, opponentRating: number) => {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
};

export const updateRating = async (winnerId: string, loserId: string) => {
  const [winner, loser] = await Promise.all([
    User.findById(winnerId),
    User.findById(loserId)
  ]);

  if (!winner || !loser) {
    throw new Error("Winner or loser not found");
  }

  const winnerExpectedScore = getExpectedScore(winner.rating, loser.rating);
  const loserExpectedScore = getExpectedScore(loser.rating, winner.rating);

  const updatedWinnerRating = Math.round(winner.rating + K_FACTOR * (1 - winnerExpectedScore));
  const updatedLoserRating = Math.round(loser.rating + K_FACTOR * (0 - loserExpectedScore));

  winner.rating = updatedWinnerRating;
  winner.matchesPlayed += 1;
  winner.wins += 1;

  loser.rating = updatedLoserRating;
  loser.matchesPlayed += 1;

  await Promise.all([winner.save(), loser.save()]);

  return {
    winner: {
      id: String(winner._id),
      handle: winner.handle,
      rating: winner.rating,
      matchesPlayed: winner.matchesPlayed,
      wins: winner.wins
    },
    loser: {
      id: String(loser._id),
      handle: loser.handle,
      rating: loser.rating,
      matchesPlayed: loser.matchesPlayed,
      wins: loser.wins
    }
  };
};
