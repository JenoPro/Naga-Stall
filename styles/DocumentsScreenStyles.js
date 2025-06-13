import { StyleSheet, Platform, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isLargeScreen = screenWidth >= 768;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  webContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    minHeight: "100vh",
  },

  webContent: {
    flex: 1,
    marginLeft: 80,
    padding: 30,
    width: "100%",
    maxWidth: "100%",
    backgroundColor: "#f5f5f5",
  },

  webHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
    borderRadius: 8,
  },

  webPageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },

  webStallBadge: {
    backgroundColor: "#1cbb1c",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  webBadgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  webTabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  webTab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "transparent",
    transition: "all 0.3s ease",
  },

  webActiveTab: {
    backgroundColor: "#4285f4",
  },

  webTabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },

  webActiveTabText: {
    color: "#fff",
  },

  webTabContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  offlineBanner: {
    backgroundColor: "#ff6b6b",
    padding: 10,
    alignItems: "center",
  },
  offlineText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  networkDetails: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  activeTab: {
    backgroundColor: "#4285f4",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "#fff",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  uploadSection: {
    gap: 15,
  },
  folderInfo: {
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  folderInfoText: {
    fontSize: 14,
    color: "#1976d2",
    textAlign: "center",
  },
  documentItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 10,
  },
  documentInfo: {
    flex: 1,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  required: {
    color: "#ff6b6b",
  },
  uploadedText: {
    fontSize: 12,
    color: "#4caf50",
  },
  selectedText: {
    fontSize: 12,
    color: "#2196f3",
  },
  documentActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  uploadButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  uploadButtonSelected: {
    backgroundColor: "#e3f2fd",
  },
  uploadIcon: {
    width: 24,
    height: 24,
  },
  submitSingleButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitSingleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  submitAllButton: {
    backgroundColor: "#4caf50",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  submitAllButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  submitAllText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  submissionsSection: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  submissionItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  submissionHeader: {
    marginBottom: 12,
  },

  submissionLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },

  submissionDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },

  submissionStatus: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "500",
  },

  imageContainer: {
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
  },

  documentThumbnail: {
    width: "100%",
    height: 200,
    backgroundColor: "#f5f5f5",
  },

  imageLoadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    fontSize: 14,
    color: "#666",
  },

  viewImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 8,
    alignItems: "center",
  },

  viewImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },

  noSubmissionsContainer: {
    alignItems: "center",
    padding: 40,
  },

  noSubmissions: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },

  noSubmissionsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCloseArea: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 0,
    maxWidth: "95%",
    maxHeight: "90%",
    overflow: "hidden",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f8f9fa",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#dc3545",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  fullSizeImage: {
    alignSelf: "center",
    margin: 16,
  },

  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#f8f9fa",
  },

  modalDate: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },

  troubleshootingBox: {
    backgroundColor: "#fff3cd",
    borderWidth: 1,
    borderColor: "#ffeaa7",
    borderRadius: 8,
    padding: 15,
    margin: 15,
  },

  troubleshootingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 8,
  },

  troubleshootingText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
  },

  ...(isWeb &&
    isLargeScreen && {
      container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      },

      documentItem: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e0e0e0",
      },

      submitAllButton: {
        backgroundColor: "#4caf50",
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 30,
        cursor: "pointer",
        transition: "all 0.3s ease",
      },

      submissionItem: {
        backgroundColor: "#fff",
        padding: 24,
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e0e0e0",
      },

      folderInfo: {
        backgroundColor: "#e3f2fd",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
      },

      troubleshootingBox: {
        backgroundColor: "#fff3cd",
        borderWidth: 1,
        borderColor: "#ffeaa7",
        borderRadius: 12,
        padding: 20,
        margin: 0,
        marginBottom: 20,
      },
    }),
});

export default styles;
