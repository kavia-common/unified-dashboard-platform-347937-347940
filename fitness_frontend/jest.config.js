/** @type {import("jest").Config} */
module.exports = {
  testEnvironment: "jsdom",
  // Keep this minimal and deterministic for CI.
  testMatch: ["**/__tests__/**/*.test.(ts|tsx|js)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Next.js builds can produce ESM in node_modules; keep transforms minimal by using SWC.
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"]
  }
};
