module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'Pagina Web/Index.JS'
  ],
  coverageDirectory: 'coverage',
  verbose: true
};
