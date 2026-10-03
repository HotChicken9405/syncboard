export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  testTimeout: 30000,
  maxWorkers: 1,
};