import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import * as Location from "expo-location";
import styles from "../../../../styles/ApplicationFormStyles";

const LocationSelector = ({ formData, updateFormData }) => {
  const [showMapView, setShowMapView] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    formData.houseLocation ? JSON.parse(formData.houseLocation) : null
  );
  const [mapRegion, setMapRegion] = useState({
    lat: 13.6218, // Naga, Bicol Region
    lng: 123.1948,
  });
  const [map, setMap] = useState(null);

  // Google Maps API key - Replace with your actual API key
  const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY_HERE";

  // Web alert function
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}: ${message}`);
    } else {
      console.log(`${title}: ${message}`);
    }
  };

  // Location handling
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showAlert(
          "Permission Denied",
          "Please grant location permission to use this feature."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setMapRegion(newRegion);
      
      // Center the map on the new location
      if (map) {
        map.panTo(newRegion);
        map.setZoom(15);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      showAlert("Error", "Could not get your current location.");
    }
  };

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setSelectedLocation({ lat, lng });
  }, []);

  const confirmLocation = () => {
    if (selectedLocation) {
      updateFormData("houseLocation", JSON.stringify(selectedLocation));
      setShowMapView(false);
      showAlert("Success", "Location selected successfully!");
    } else {
      showAlert(
        "No Location",
        "Please tap on the map to select a location first."
      );
    }
  };

  const formatLocationText = (coords) => {
    if (!coords) return "No location selected";
    return `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;
  };

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
    flex: 1,
  };

  const options = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: true,
    fullscreenControl: false,
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.labelText, { marginBottom: 10 }]}>
        House Location
      </Text>

      {selectedLocation ? (
        <View style={styles.locationPreview}>
          <Text style={styles.locationText}>
            📍 {formatLocationText(selectedLocation)}
          </Text>
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setShowMapView(true)}
          >
            <Text style={styles.changeButtonText}>Change Location</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowMapView(true)}
        >
          <Text style={styles.locationButtonText}>
            📍 Select Location on Map
          </Text>
        </TouchableOpacity>
      )}

      {/* Map Modal */}
      <Modal
        visible={showMapView}
        animationType="slide"
        onRequestClose={() => setShowMapView(false)}
      >
        <View style={locationStyles.mapModal}>
          {/* Map Header */}
          <View style={locationStyles.mapHeader}>
            <Text style={locationStyles.mapTitle}>📍 Select House Location</Text>
            <Text style={locationStyles.mapSubtitle}>
              Click anywhere on the map to pin your location
            </Text>
          </View>

          {/* Google Map */}
          <View style={locationStyles.mapContainer}>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapRegion}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={options}
              >
                {selectedLocation && (
                  <Marker
                    position={selectedLocation}
                    title="Selected Location"
                    animation={window.google?.maps?.Animation?.DROP}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </View>

          {/* Map Controls */}
          <View style={locationStyles.mapControls}>
            <TouchableOpacity
              style={locationStyles.locationButton}
              onPress={getCurrentLocation}
            >
              <Text style={locationStyles.locationButtonText}>
                📱 Use My Location
              </Text>
            </TouchableOpacity>

            {selectedLocation && (
              <View style={locationStyles.selectedInfo}>
                <Text style={locationStyles.selectedText}>
                  📌 Selected: {formatLocationText(selectedLocation)}
                </Text>
              </View>
            )}

            <View style={locationStyles.buttonGroup}>
              <TouchableOpacity
                style={[locationStyles.actionButton, locationStyles.confirmButton]}
                onPress={confirmLocation}
              >
                <Text style={locationStyles.confirmButtonText}>
                  ✅ Confirm Location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[locationStyles.actionButton, locationStyles.cancelButton]}
                onPress={() => setShowMapView(false)}
              >
                <Text style={locationStyles.cancelButtonText}>❌ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Location-specific styles
const locationStyles = StyleSheet.create({
  mapModal: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  mapHeader: {
    backgroundColor: "white",
    padding: 20,
    paddingTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 5,
  },
  mapSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    height: 400,
  },
  mapControls: {
    backgroundColor: "white",
    padding: 20,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  locationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  selectedInfo: {
    backgroundColor: "#e7f3ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#bee5eb",
  },
  selectedText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#28a745",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LocationSelector;