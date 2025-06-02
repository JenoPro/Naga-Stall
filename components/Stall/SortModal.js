import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";

const SortModal = ({ visible, sortBy, onSelectOption, onClose, stallId }) => {
  const [stallStatuses, setStallStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Static price option
  const priceOption = "Price";

  // Fetch stall statuses when modal becomes visible
  useEffect(() => {
    if (visible) {
      fetchStallStatuses();
    }
  }, [visible]);

  const fetchStallStatuses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch distinct statuses from your stall table
      const response = await fetch('/api/Stall/status');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stall statuses');
      }
      
      const data = await response.json();
      
      // Extract unique statuses from the response
      // Expecting: { statuses: ['available', 'countdown', 'raffle', ...] }
      const uniqueStatuses = data.statuses || [];
      
      // Filter and format valid statuses
      const validStatuses = uniqueStatuses
        .filter(status => status && ['Available', 'Countdown', 'Raffle'].includes(status.toLowerCase()))
        .map(status => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase())
        .sort(); // Sort alphabetically for consistent order
      
      // Ensure we have at least the basic statuses
      const defaultStatuses = ['Available', 'Countdown', 'Raffle'];
      const finalStatuses = validStatuses.length > 0 ? validStatuses : defaultStatuses;
      
      setStallStatuses(finalStatuses);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stall statuses:', err);
      
      // Fallback to default statuses if API fails
      setStallStatuses(['Available', 'Countdown', 'Raffle']);
    } finally {
      setLoading(false);
    }
  };

  // Combine status options with price option
  const sortOptions = [...stallStatuses, priceOption];

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading sort options...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error loading options</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={fetchStallStatuses}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.sortModalTitle}>Sort By</Text>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.sortOption,
              sortBy === option && styles.activeSortOption,
            ]}
            onPress={() => onSelectOption(option)}
          >
            <Text
              style={[
                styles.sortOptionText,
                sortBy === option && styles.activeSortOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.popupOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sortModalContainer}>
          {renderContent()}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sortModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 200,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  activeSortOption: {
    backgroundColor: "#e6f2ff",
  },
  sortOptionText: {
    fontSize: 16,
    textAlign: "center",
  },
  activeSortOptionText: {
    color: "#2563eb",
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#dc2626",
    marginBottom: 15,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default SortModal;