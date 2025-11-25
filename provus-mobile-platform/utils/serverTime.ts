let serverTimeOffset = 0;

export const setServerTimeOffset = (serverDateStr: string) => {
  if (!serverDateStr) return;

  const serverTime = new Date(serverDateStr).getTime();
  const deviceTime = Date.now();

  serverTimeOffset = serverTime - deviceTime;
};

export const getServerTime = () => {
  return new Date(Date.now() + serverTimeOffset);
};

export const getOffset = () => serverTimeOffset;
