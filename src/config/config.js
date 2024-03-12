module.exports = {
  mongoUri: process.env.MONGO_URI,
  testMongoUri: process.env.TEST_MONGO_URI,
  PORT: process.env.PORT || 3000,
  TESTPORT: 3523,
  HOSTNAME: "127.0.0.1",
  TCP_PORT: 2375,
  /* Insecure if commited to public repository....THIS SHOULD BE A SECRET! Left here for convenience..Which is convenient for others too ;)*/
  saltRounds: 10,
  accessTokenSecret:
    "eyJhbGciOiJIUzUxMiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTYzNzM5NTMzMywiaWF0IjoxNjM3Mzk1MzMzfQ.YsAj_HkDvbuMcOLBwglw_bnEIbs1iPHkCc_X1aH36zCkBlb0wQbMiqKBknOXHr6x2klAmOOM7IaCSkSRAwpFTw",
};
