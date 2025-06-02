import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import styles from "../../../../styles/ApplicationFormStyles";

const LocationSelector = ({ formData, updateFormData }) => {
  const [showMapView, setShowMapView] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(
    formData.houseLocation ? JSON.parse(formData.houseLocation) : null
  );
  const [mapRegion, setMapRegion] = useState({
    latitude: 13.6218, // Naga, Bicol Region
    longitude: 123.1948,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef();

  // Location handling
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please grant location permission to use this feature."
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setMapRegion(newRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your current location.");
    }
  };

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ lat: latitude, lng: longitude });
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      updateFormData("houseLocation", JSON.stringify(selectedLocation));
      setShowMapView(false);
      Alert.alert("Success", "Location selected successfully!");
    } else {
      Alert.alert(
        "No Location",
        "Please tap on the map to select a location first."
      );
    }
  };

  const formatLocationText = (coords) => {
    if (!coords) return "No location selected";
    return `Lat: ${coords.lat.toFixed(6)}, Lng: ${coords.lng.toFixed(6)}`;
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
              Tap anywhere on the map to pin your location
            </Text>
          </View>

          {/* Map View */}
          <MapView
            ref={mapRef}
            style={locationStyles.map}
            region={mapRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}
          >
            {selectedLocation && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.lat,
                  longitude: selectedLocation.lng,
                }}
                title="Selected Location"
                description="Your house location"
                pinColor="red"
              />
            )}
          </MapView>

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
    paddingTop: 50,
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
  map: {
    flex: 1,
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