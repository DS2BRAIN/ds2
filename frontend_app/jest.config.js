module.exports = {
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "json"],
    transform: {
        '^.+\\.(js|jsx)?$': 'babel-jest'
    },
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        "\\.(png|jpg|gif|ttf|eot|svg)$": "<rootDir>/__mocks__/fileMock.js",
        "\\.(css|less|sass|scss)$": "<rootDir>/__mocks__/styleMock.js",
    },
    testMatch: [
        '<rootDir>/**/*.test.(js|jsx|ts|tsx)', '<rootDir>/(tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx))'
    ],
    transformIgnorePatterns: ['<rootDir>/node_modules/'],
    moduleDirectories: [ "src", "node_modules" ]
};