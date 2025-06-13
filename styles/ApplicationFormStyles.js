import { StyleSheet, Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  formContainer: {
    width: "95%",
    height: "90%",
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    color: "#666",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  touchableContainer: {
    flex: 1,
    minHeight: screenHeight * 0.5,
  },
  stepContainer: {
    paddingBottom: 20,
    minHeight: screenHeight * 0.4,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 50,
  },
  textArea: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    minHeight: 100,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  navButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  stepIndicator: {
    fontSize: 16,
    color: "#666",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  dropdownContainer: {
    marginBottom: 15,
    position: "relative",
    zIndex: 1,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  placeholderText: {
    color: "#999",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#666",
  },
  dropdownMenu: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 100,
    overflow: "hidden",
  },
  dropdownScrollView: {
    maxHeight: 150,
    flex: 1,
  },
  dropdownScrollContent: {
    paddingVertical: 0,
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
    height: 44,
    justifyContent: "center",
  },
  lastDropdownOption: {
    borderBottomWidth: 0,
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#333",
  },

  signatureButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  signatureButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  signaturePreview: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  signatureImage: {
    width: "100%",
    height: 100,
    backgroundColor: "white",
    borderRadius: 4,
  },
  changeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 10,
  },
  changeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },

  locationButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "#28a745",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  locationButtonText: {
    color: "#28a745",
    fontSize: 16,
    fontWeight: "500",
  },
  locationPreview: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },

  signatureModal: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  signatureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "white",
  },
  signatureTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  signatureControls: {
    flexDirection: "row",
    gap: 10,
  },
  clearButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default styles;
