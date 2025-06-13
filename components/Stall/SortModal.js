import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { supabase } from "../../config/supabaseClient";

const SortModal = ({ visible, sortBy, onSelectOption, onClose, stallId }) => {
  const [stallStatuses, setStallStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      // Fetch distinct statuses from Stall table
      const { data: stallData, error: stallError } = await supabase
        .from('Stall')
        .select('status')
        .not('status', 'is', null);

      if (stallError) throw stallError;

      // Get unique statuses from stalls
      const stallStatuses = stallData?.map(item => item.status) || [];
      const uniqueStatuses = [...new Set(stallStatuses)]
        .filter(status => status && typeof status === 'string')
        .map(status => {
          // Capitalize first letter and keep the rest as is
          return status.charAt(0).toUpperCase() + status.slice(1);
        });

      // Define the correct order: Available -> Applied -> Raffle -> Countdown
      const statusOrder = ['Available', 'Applied', 'Raffle', 'Countdown'];
      
      // Sort statuses according to your preferred order
      const sortedStatuses = statusOrder.filter(status => 
        uniqueStatuses.includes(status)
      );

      // Add any other statuses that might exist but aren't in our predefined order
      const otherStatuses = uniqueStatuses
        .filter(status => !statusOrder.includes(status))
        .sort();

      const finalStatuses = [...sortedStatuses, ...otherStatuses];

      // Set the statuses or fallback to defaults with correct order
      setStallStatuses(finalStatuses.length > 0 ? finalStatuses : ['Available', 'Applied', 'Raffle', 'Countdown']);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stall statuses:', err);
      
      // Fallback to default statuses with correct order if API fails
      setStallStatuses(['Available', 'Applied', 'Raffle', 'Countdown']);
    } finally {
      setLoading(false);
    }
  };

  // Combine status options with other sort options
  const sortOptions = [...stallStatuses, 'Stall', 'Price', 'Location'];

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
            onPress={() => {
              onSelectOption(option);
              onClose(); // Close modal after selection
            }}
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
        <TouchableOpacity
          style={styles.sortModalContainer}
          activeOpacity={1}
          onPress={() => {}} // Prevent modal from closing when tapping inside
        >
          {renderContent()}
        </TouchableOpacity>
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
    maxWidth: 300,
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
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeSortOption: {
    backgroundColor: "#e6f2ff",
    borderColor: "#2563eb",
  },
  sortOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
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