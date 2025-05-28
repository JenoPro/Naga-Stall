import React from "react";
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet } from "react-native";

const ImageViewerModal = ({ visible, imageUrl, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.imageModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.imageModalContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.fullSizeImage}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.noImageText}>No image available</Text>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  imageModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  imageModalContainer: {
    width: "90%",
    height: "70%",
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fullSizeImage: {
    width: "100%",
    height: "90%",
    borderRadius: 5,
  },
  noImageText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontWeight: "bold",
    color: "#000",
  },
});

export default ImageViewerModal;