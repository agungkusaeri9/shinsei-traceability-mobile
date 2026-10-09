module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-async-storage|@react-navigation|lucide-react-native|react-native-toast-message|react-native-image-picker)/)',
  ],
};




