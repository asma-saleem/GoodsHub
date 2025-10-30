module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'app/api/**/*.ts',
    '!app/api/**/route.tsx'
  ],
  coverageReporters: ['text', 'lcov']
};
