import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Alert,
} from "react-native";
import supabase from "../../config/supabaseClient";
import styles from "../../styles/DocumentsScreenStyles";

const MySubmissionsTab = ({ userFullname }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState({});

  // Get screen dimensions for modal
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Document types configuration
  const documentTypes = [
    { key: "awardPaper", label: "Award Paper", column: "AwardPaper", required: true },
    { key: "leaseContract", label: "Lease Contract", column: "LeaseContract", required: true },
    { key: "mepoMarketClearance", label: "MEPO Market Clearance", column: "MEPOMarketClearance", required: true },
    { key: "barangayBusinessClearance", label: "Barangay Business Clearance", column: "BarangayBusinessClearance", required: true },
    { key: "cedula", label: "Cedula", column: "Cedula", required: true },
    { key: "associationClearance", label: "Association Clearance", column: "AssociationClearance", required: false },
    { key: "voterIdRegistration", label: "Voter's ID/Voter's Registration", column: "Voter'sID", required: true },
    { key: "healthCardYellowCard", label: "Health Card/Yellow Card", column: "HealthCard", required: true },
  ];

  // Load uploaded documents when user data is available
  useEffect(() => {
    if (userFullname) {
      loadUploadedDocuments();
    }
  }, [userFullname]);

  // Helper function to format date only (no time)
  const getDateOnly = (timestamp) => {
    if (!timestamp) return "Unknown date";
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const loadUploadedDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("registrantFullName", userFullname)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading documents:", error);
        return;
      }

      if (data) {
        const docsObj = {};
        documentTypes.forEach((docType) => {
          const dbValue = data[docType.column];
          const uploadTimestamp = data[`${docType.column}_uploaded_at`];

          if (dbValue) {
            docsObj[docType.key] = {
              id: data.documentId,
              filename: dbValue,
              fileUrl: dbValue,
              uploadedAt: uploadTimestamp || data.created_at,
              formattedDate: formatDateToMMDDYY(
                uploadTimestamp || data.created_at
              ),
              status: "uploaded",
            };
          }
        });
        setUploadedDocuments(docsObj);
      }
    } catch (error) {
      console.error("Error loading uploaded documents:", error);
    }
  };

  const handleImagePress = (document) => {
    setSelectedImage(document);
    setImageModalVisible(true);
  };

  const handleImageLoadStart = (docKey) => {
    setImageLoading(prev => ({ ...prev, [docKey]: true }));
  };

  const handleImageLoadEnd = (docKey) => {
    setImageLoading(prev => ({ ...prev, [docKey]: false }));
  };

  const handleImageError = (docKey, docLabel) => {
    setImageLoading(prev => ({ ...prev, [docKey]: false }));
    Alert.alert(
      "Image Load Error",
      `Failed to load ${docLabel}. The image may be corrupted or the link is invalid.`
    );
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
    setSelectedImage(null);
  };

  const renderDocumentItem = (docConfig) => {
    const uploadedDoc = uploadedDocuments[docConfig.key];
    if (!uploadedDoc) return null;

    const isLoading = imageLoading[docConfig.key];

    return (
      <View key={docConfig.key} style={styles.submissionItem}>
        <View style={styles.submissionHeader}>
          <Text style={styles.submissionLabel}>{docConfig.label}</Text>
          
          {/* Date display */}
          <View style={styles.dateContainer}>
            <Text style={styles.submissionDate}>
              📅 {uploadedDoc.uploadDate}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusIndicator} />
            <Text style={styles.submissionStatus}>
              {uploadedDoc.status === 'uploaded' ? 'Successfully Uploaded' : uploadedDoc.status}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.imageContainer}
          onPress={() => handleImagePress(uploadedDoc)}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: uploadedDoc.fileUrl }}
            style={styles.documentThumbnail}
            resizeMode="cover"
            onLoadStart={() => handleImageLoadStart(docConfig.key)}
            onLoadEnd={() => handleImageLoadEnd(docConfig.key)}
            onError={() => handleImageError(docConfig.key, docConfig.label)}
          />
          {isLoading && (
            <View style={styles.imageLoadingOverlay}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}
          <View style={styles.viewImageOverlay}>
            <Text style={styles.viewImageText}>Tap to view full size</Text>
          </View>
          
          {/* Date badge on image */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>{uploadedDoc.uploadDate}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.submissionsSection}>
         
          {Object.keys(uploadedDocuments).length > 0 ? (
            documentTypes.map(renderDocumentItem)
          ) : (
            <View style={styles.noSubmissionsContainer}>
              <Text style={styles.noSubmissions}>No documents uploaded yet.</Text>
              <Text style={styles.noSubmissionsSubtext}>
                Upload your documents in the "Upload Documents" tab to see them here.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <TouchableOpacity 
          style={styles.modalContainer}
          onPress={closeImageModal}
          activeOpacity={1}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
            activeOpacity={1}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedImage?.label || 'Document'}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={closeImageModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {selectedImage && (
              <ScrollView 
                contentContainerStyle={styles.imageScrollContainer}
                maximumZoomScale={3}
                minimumZoomScale={1}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
              >
                <Image
                  source={{ uri: selectedImage.fileUrl }}
                  style={[
                    styles.fullSizeImage,
                    {
                      width: screenWidth * 0.85,
                      height: screenHeight * 0.6,
                    }
                  ]}
                  resizeMode="contain"
                />
              </ScrollView>
            )}
            
            <View style={styles.modalFooter}>
              <Text style={styles.modalDate}>
                Uploaded: {selectedImage ? getDateOnly(selectedImage.uploadedAt) : ''}
              </Text>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

export default MySubmissionsTab;