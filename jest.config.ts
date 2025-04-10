
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@shared/(.*)$': '<rootDir>/shared/$1'
  },
  testMatch: [
    '<rootDir>/client/src/**/*.test.{ts,tsx}',
    '<rootDir>/server/__tests__/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'client/src/**/*.{ts,tsx}',
    'server/**/*.ts',
    '!**/*.d.ts'
  ]
};
