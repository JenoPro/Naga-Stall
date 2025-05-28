import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import styles from "../../styles/DocumentsScreenStyles";
import  DocumentItem from "./Components-Submissiontab/DocumentItem";
import { NetworkTroubleshooting } from "./Components-Submissiontab/NetworkTroubleshooting";
import { useDocumentUpload } from "./Components-Submissiontab/useDocumentUpload";
import { useDocumentState } from "./Components-Submissiontab/useDocumentState";
import { documentTypes } from "./Components-Submissiontab/documentConfig";

const MySubmissionTab = ({ userFullname, isConnected }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    documents,
    setDocuments,
    uploadedDocuments,
    setUploadedDocuments,
    uploadingDocs,
    setUploadingDocs,
    loadUploadedDocuments,
  } = useDocumentState(userFullname);

  const {
    testNetworkConnectivity,
    uploadDocumentToSupabase,
    updateDocumentsTable,
    deleteOldDocument,
  } = useDocumentUpload(userFullname);

  useEffect(() => {
    if (userFullname) {
      loadUploadedDocuments();
    }
  }, [userFullname]);

  const pickDocument = async (documentType) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need media library permissions to upload documents"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.7,
        exif: false,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        setDocuments((prev) => ({
          ...prev,
          [documentType]: {
            uri: asset.uri,
            mimeType: asset.mimeType || "image/jpeg",
            fileSize: asset.fileSize || 0,
            width: asset.width,
            height: asset.height,
            status: "selected",
          },
        }));
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", `Failed to select document: ${error.message}`);
    }
  };

  const handleSingleUpload = async (documentType, documentLabel) => {
    const documentData = documents[documentType];
    if (!documentData) {
      Alert.alert("No Document", "Please select a document first.");
      return;
    }

    if (!isConnected) {
      Alert.alert(
        "No Internet",
        "Please check your internet connection and try again."
      );
      return;
    }

    const hasExistingDoc = uploadedDocuments[documentType];

    if (hasExistingDoc) {
      Alert.alert(
        "Replace Document",
        `You already have a ${documentLabel} uploaded. Do you want to replace it?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Replace",
            style: "destructive",
            onPress: () => performUpload(documentType, documentLabel),
          },
        ]
      );
    } else {
      await performUpload(documentType, documentLabel);
    }
  };

  const performUpload = async (documentType, documentLabel) => {
    const documentData = documents[documentType];

    try {
      setUploadingDocs((prev) => ({ ...prev, [documentType]: true }));
      setDocuments((prev) => ({
        ...prev,
        [documentType]: { ...prev[documentType], status: "uploading" },
      }));

      if (uploadedDocuments[documentType]) {
        const deleteResult = await deleteOldDocument(documentType);
        if (!deleteResult.success) {
          console.log("Warning: Could not delete old document:", deleteResult.error);
        }
      }

      const uploadResult = await uploadDocumentToSupabase(
        documentData,
        documentType,
        documentLabel
      );

      if (uploadResult.success) {
        const dbResult = await updateDocumentsTable(documentType, uploadResult.publicUrl);

        if (dbResult.success) {
          const action = uploadedDocuments[documentType] ? "replaced" : "uploaded";
          Alert.alert("Success", `${documentLabel} ${action} successfully!`);

          setDocuments((prev) => ({ ...prev, [documentType]: null }));
          await loadUploadedDocuments();
        } else {
          setDocuments((prev) => ({
            ...prev,
            [documentType]: { ...prev[documentType], status: "failed" },
          }));
          Alert.alert(
            "Upload Failed",
            `File uploaded but database update failed: ${dbResult.error}`
          );
        }
      } else {
        setDocuments((prev) => ({
          ...prev,
          [documentType]: { ...prev[documentType], status: "failed" },
        }));
        Alert.alert("Upload Failed", uploadResult.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setDocuments((prev) => ({
        ...prev,
        [documentType]: { ...prev[documentType], status: "failed" },
      }));
      Alert.alert("Error", `Failed to upload document: ${error.message}`);
    } finally {
      setUploadingDocs((prev) => ({ ...prev, [documentType]: false }));
    }
  };

  const handleSubmitAllDocuments = async () => {
    if (!isConnected || !userFullname) {
      Alert.alert("Error", "Please check your connection and try again.");
      return;
    }

    const networkTest = await testNetworkConnectivity();
    if (!networkTest.success) {
      Alert.alert(
        "Connection Error",
        `Network issue detected: ${networkTest.error}\n\nPlease check your internet connection and try again.`
      );
      return;
    }

    const requiredDocs = documentTypes.filter((doc) => doc.required);
    const missingDocs = requiredDocs.filter(
      (doc) => !documents[doc.key] && !uploadedDocuments[doc.key]
    );

    if (missingDocs.length > 0) {
      const missingLabels = missingDocs.map((doc) => doc.label).join(", ");
      Alert.alert("Missing Required Documents", `Please upload: ${missingLabels}`);
      return;
    }

    const docsToUpload = Object.keys(documents).filter(
      (key) => documents[key] !== null
    );

    if (docsToUpload.length === 0) {
      Alert.alert("No Documents", "No new documents to upload.");
      return;
    }

    try {
      setIsLoading(true);
      let successCount = 0;
      let failedDocs = [];

      for (const docType of docsToUpload) {
        const docConfig = documentTypes.find((d) => d.key === docType);
        if (docConfig) {
          if (uploadedDocuments[docType]) {
            await deleteOldDocument(docType);
          }

          const uploadResult = await uploadDocumentToSupabase(
            documents[docType],
            docType,
            docConfig.label
          );

          if (uploadResult.success) {
            const dbResult = await updateDocumentsTable(docType, uploadResult.publicUrl);
            if (dbResult.success) {
              successCount++;
            } else {
              failedDocs.push(docConfig.label);
            }
          } else {
            failedDocs.push(docConfig.label);
          }
        }
      }

      if (successCount > 0) {
        let message = `Successfully uploaded ${successCount} document(s).`;
        if (failedDocs.length > 0) {
          message += `\n\nFailed to upload: ${failedDocs.join(", ")}`;
        }
        Alert.alert("Upload Complete", message);

        setDocuments({
          awardPaper: null,
          leaseContract: null,
          mepoMarketClearance: null,
          barangayBusinessClearance: null,
          cedula: null,
          associationClearance: null,
          voterIdRegistration: null,
          healthCardYellowCard: null,
        });
        await loadUploadedDocuments();
      } else {
        Alert.alert(
          "Upload Failed",
          "Failed to upload documents. Please check your connection and try again."
        );
      }
    } catch (error) {
      console.error("Bulk upload error:", error);
      Alert.alert("Error", `Failed to upload documents: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getDocumentStatus = (docConfig) => {
    const documentData = documents[docConfig.key];
    const uploadedDoc = uploadedDocuments[docConfig.key];
    const isUploading = uploadingDocs[docConfig.key];

    if (isUploading || (documentData && documentData.status === "uploading")) {
      return "uploading";
    }
    if (documentData && documentData.status === "failed") {
      return "failed";
    }
    if (uploadedDoc) {
      return "uploaded";
    }
    if (documentData) {
      return "selected";
    }
    return "none";
  };

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
      <View style={styles.uploadSection}>
        {!isConnected && <NetworkTroubleshooting />}

        {documentTypes.map((docConfig) => (
          <DocumentItem
            key={docConfig.key}
            docConfig={docConfig}
            documentData={documents[docConfig.key]}
            uploadedDoc={uploadedDocuments[docConfig.key]}
            status={getDocumentStatus(docConfig)}
            isUploading={uploadingDocs[docConfig.key]}
            onPickDocument={() => pickDocument(docConfig.key)}
            onUpload={() => handleSingleUpload(docConfig.key, docConfig.label)}
          />
        ))}

        <TouchableOpacity
          style={[
            styles.submitAllButton,
            (isLoading || !isConnected) && styles.submitAllButtonDisabled,
          ]}
          onPress={handleSubmitAllDocuments}
          disabled={isLoading || !isConnected}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitAllText}>Submit Documents</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default MySubmissionTab;