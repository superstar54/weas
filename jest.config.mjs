// jest.config.js
export default {
  // Transform both .js and .mjs via Babel
  transform: {
    "^.+\\.m?[tj]s$": "babel-jest",
  },

  // Only run your .mjs tests
  testRegex: "\\.test\\.mjs$",

  // Resolve these extensions
  moduleFileExtensions: ["mjs", "js", "json", "node"],

  testEnvironment: "jsdom",
};
