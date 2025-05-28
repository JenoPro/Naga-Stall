import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";

const FilterBar = ({ 
  sortBy, 
  notificationStatus, 
  onNotificationToggle,
  onFilterClick
}) => {
  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={onFilterClick}
      >
        <Text style={styles.filterText}>Sort By: {sortBy}</Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.notificationButton}
        onPress={onNotificationToggle}
      >
        <Image
          source={require("../assets/notification-icon.png")}
          style={[
            styles.notificationIcon,
            { tintColor: notificationStatus ? "#2563eb" : "#333" },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  filterButton: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontWeight: "bold",
    marginRight: 5,
  },
  dropdownIcon: {
    fontSize: 12,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
});

export default FilterBar;