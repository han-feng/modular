module.exports = {
  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest"
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testMatch: [
    "**/test/unit/**/*.(test|spec).(js|ts)"
  ],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,js,json}"
  ],
  browser: true,
  collectCoverage: true
}
