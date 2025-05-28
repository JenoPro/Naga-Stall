import React from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";

const SortModal = ({ visible, sortBy, onSelectOption, onClose }) => {
  const sortOptions = ["Stall", "Price", "Location"];

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
});

export default SortModal;