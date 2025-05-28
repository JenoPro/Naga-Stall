import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const UserHeader = ({ userFullname, userEmail, stallNumber = "None" }) => {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.userName}>👤 {userFullname}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
      </View>
      <TouchableOpacity style={styles.stallBadge}>
        <Text style={styles.badgeText}>STALL#: {stallNumber}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userEmail: {
    fontSize: 13,
    color: "#555",
    marginTop: -5,
  },
  stallBadge: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserHeader;