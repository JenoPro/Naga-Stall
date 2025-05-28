import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const StallCard = ({ item }) => {


  const renderStatusButton = (status) => {
    switch (status) {
      case "raffle":
        return (
          <TouchableOpacity style={styles.raffleButton} disabled>
            <Text style={styles.raffleText}>RAFFLE ONGOING</Text>
          </TouchableOpacity>
        );
      case "countdown":
        return (
          <TouchableOpacity style={styles.countdownButton} disabled>
            <Text style={styles.countdownText}>COUNTDOWN</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      {item.status === "raffle" && (
        <View style={styles.liveBadge}>
          <Text style={styles.liveBadgeText}>Live</Text>
        </View>
      )}
      <View style={styles.infoContainer}>
        <View style={styles.stallNameContainer}>
          <Text style={styles.stallName}>{item.name}</Text>
        </View>
        <Text style={styles.details}>{item.location}</Text>
        <Text style={styles.details}>{item.size}</Text>
        {renderStatusButton(item.status)}
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
    overflow: "hidden",
    flexDirection: "row",
    height: 120,
  },
  image: {
    width: "40%",
    height: "100%",
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "red",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  liveBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  infoContainer: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },
  stallNameContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  stallName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  details: {
    fontSize: 12,
    color: "#666",
  },
  raffleButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  raffleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  countdownButton: {
    backgroundColor: "red",
    paddingVertical: 6,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 5,
  },
  countdownText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
});

export default StallCard;