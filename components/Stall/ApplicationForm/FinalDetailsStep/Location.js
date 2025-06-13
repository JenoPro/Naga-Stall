import { Platform } from 'react-native';

let LocationSelector;

if (Platform.OS === 'web') {
  // Use Google Maps version for web
  LocationSelector = require('./LocationSelector.web').default;
} else {
  // Use react-native-maps version for native platforms
  LocationSelector = require('./LocationSelector.native').default;
}

export default LocationSelector;