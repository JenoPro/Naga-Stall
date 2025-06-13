const { getDefaultConfig } = require("@expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.platforms = ["ios", "android", "native", "web"];

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "web.js",
  "web.ts",
  "web.tsx",
];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    (moduleName === "react-native-maps" ||
      moduleName.includes("react-native-maps"))
  ) {
    return {
      type: "empty",
    };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
