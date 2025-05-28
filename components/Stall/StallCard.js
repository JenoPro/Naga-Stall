import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

const StallCard = ({ item, handleViewImage, onApplyNow }) => {
  const renderStatusButton = (status) => {
    switch (status) {
      case "available":
        return (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={onApplyNow}
          >
            <Text style={styles.applyText}>APPLY NOW!</Text>
          </TouchableOpacity>
        );
      case "locked":
        return (
          <TouchableOpacity style={styles.lockButton} disabled>
            <Text style={styles.lockText}>🔒 LOCK</Text>
          </TouchableOpacity>
        );
      case "raffle":
        return (
          <TouchableOpacity style={styles.raffleButton} disabled>
            <Text style={styles.raffleText}>RAFFLE ONGOING</Text>
          </TouchableOpacity>
        );
      case "applied":
        return (
          <TouchableOpacity style={styles.appliedButton} disabled>
            <Text style={styles.appliedText}>ALREADY APPLIED</Text>
          </TouchableOpacity>
        );
      case "approved":
        return (
          <TouchableOpacity style={styles.approvedButton} disabled>
            <Text style={styles.approvedText}>APPROVED</Text>
          </TouchableOpacity>
        );
      default:
        return (
          <TouchableOpacity style={styles.unknownButton} disabled>
            <Text style={styles.unknownText}>UNKNOWN STATUS</Text>
          </TouchableOpacity>
        );
    }
  };

  return (
    <View style={styles.card}>
      {/* Stall Image */}
      <TouchableOpacity
        onPress={() =>
          item.originalImagePath && handleViewImage(item.originalImagePath)
        }
      >
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.image}
            onError={(e) => {
              console.log(
                `❌ Error loading image for stall #${item.stall_number}:`,
                e.nativeEvent.error
              );
            }}
          />
        ) : (
          <Image
            source={require("../../assets/stall.png")}
            style={styles.image}
            onError={(e) => {
              console.log(
                `❌ Error loading default image for stall #${item.stall_number}:`,
                e.nativeEvent.error
              );
            }}
          />
        )}
      </TouchableOpacity>
      
      {/* Stall Information */}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.stallName}>STALL# {item.stall_number}</Text>
          <Text style={styles.price}>{item.price} Php / Monthly</Text>
        </View>
        <Text style={styles.details}>{item.location}</Text>
        <Text style={styles.details}>{item.size}</Text>
        <View style={styles.statusContainer}>
          {renderStatusButton(item.status)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  info: {
    padding: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stallName: {
    fontWeight: "bold",
    fontSize: 14,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  price: {
    fontWeight: "bold",
    fontSize: 14,
  },
  details: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  statusContainer: {
    marginTop: 10,
  },
  applyButton: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  applyText: {
    color: "#fff",
    fontWeight: "bold",
  },
  lockButton: {
    backgroundColor: "#ddd",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  lockText: {
    fontWeight: "bold",
  },
  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  raffleText: {
    color: "#fff",
    fontWeight: "bold",
  },
  appliedButton: {
    backgroundColor: "#aaa",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  appliedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  approvedButton: {
    backgroundColor: "#4c9e4c",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  approvedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  unknownButton: {
    backgroundColor: "#f0ad4e",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  unknownText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StallCard;