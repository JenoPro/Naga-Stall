import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    borderRadius: 10,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  submissionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  submissionDate: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  submissionStatus: {
    fontSize: 12,
    color: "#4caf50",
    textTransform: "capitalize",
  },
  noSubmissions: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
  // Enhanced submission item styles
  submissionItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  submissionHeader: {
    marginBottom: 12,
  },
  
  submissionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  
  submissionDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  
  submissionStatus: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },

  // Image container and thumbnail styles
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  
  documentThumbnail: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  
  viewImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    alignItems: 'center',
  },
  
  viewImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // No submissions styles
  noSubmissionsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  
  noSubmissions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  noSubmissionsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalCloseArea: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 0,
    maxWidth: '95%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  fullSizeImage: {
    alignSelf: 'center',
    margin: 16,
  },
  
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  
  modalDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // ADD THESE MISSING TROUBLESHOOTING STYLES
troubleshootingBox: {
  backgroundColor: '#fff3cd',
  borderWidth: 1,
  borderColor: '#ffeaa7',
  borderRadius: 8,
  padding: 15,
  margin: 15,
},

troubleshootingTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#856404',
  marginBottom: 8,
},

troubleshootingText: {
  fontSize: 14,
  color: '#856404',
  lineHeight: 20,
},
});

export default styles;