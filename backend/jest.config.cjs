/** @type {import('jest').Config} */
module.exports = {
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s"],
  transform: { "^.+\\.(t|j)s$": ["@swc/jest", {}] },
  moduleFileExtensions: ["ts", "js", "json"],
  testEnvironment: "node",
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.ts",
    "<rootDir>/tests/jest-prisma-mock.js"
  ],
  collectCoverage: false
};
