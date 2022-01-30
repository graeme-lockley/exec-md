module.exports = {
    preset: 'ts-jest',
    moduleDirectories: ["node_modules", "src"],
    modulePathIgnorePatterns: ["^.+Harness.js"],
    transform: {
        '^.+\\.(ts|tsx)?$': 'ts-jest',
        "^.+\\.(js|jsx)$": "babel-jest"
    }
};