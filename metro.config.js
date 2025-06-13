const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle platform-specific imports
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Platform-specific extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.js', 'web.ts', 'web.tsx'];

// Add custom resolver for platform-specific modules
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Block react-native-maps on web platform
  if (platform === 'web' && (moduleName === 'react-native-maps' || moduleName.includes('react-native-maps'))) {
    // Return a mock resolution to prevent the error
    return {
      type: 'empty',
    };
  }
  
  // Use default resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;