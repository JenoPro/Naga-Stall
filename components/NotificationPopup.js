import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";

const NotificationPopup = ({ visible, message, onClose }) => {
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
        <View style={styles.popupContainer}>
          <Text style={styles.popupText}>{message}</Text>
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
  popupContainer: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 15,
    width: "80%",
    alignItems: "center",
  },
  popupText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default NotificationPopup;