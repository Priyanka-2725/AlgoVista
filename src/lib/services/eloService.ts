/**
 * Elo Rating System Service
 * 
 * E = 1 / (1 + 10^((opponentRating - playerRating)/400))
 * Rnew = Rold + 32 * (result - E)
 */

export const calculateExpectedScore = (playerRating: number, opponentRating: number): number => {
  return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
};

export const calculateRatingChange = (
  playerRating: number,
  opponentRating: number,
  result: 1 | 0.5 | 0 // 1 for win, 0.5 for draw, 0 for loss
): number => {
  const K = 32;
  const expected = calculateExpectedScore(playerRating, opponentRating);
  return Math.round(K * (result - expected));
};
