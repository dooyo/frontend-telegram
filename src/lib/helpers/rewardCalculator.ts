const TOKEN_RATE_PER_SECOND = 0.001;

export const calculateLiveReward = (createdAt: string): number => {
  const startTime = new Date(createdAt).getTime();
  const currentTime = new Date().getTime();
  const secondsAlive = Math.floor((currentTime - startTime) / 1000);
  return secondsAlive * TOKEN_RATE_PER_SECOND;
};

export const calculateTotalLiveRewards = (
  posts: Array<{ createdAt: string }> = [],
  comments: Array<{ createdAt: string }> = []
): number => {
  const allItems = [...posts, ...comments];
  return allItems.reduce(
    (total, item) => total + calculateLiveReward(item.createdAt),
    0
  );
};
