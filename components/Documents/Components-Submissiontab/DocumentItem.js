import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import styles from "../../../styles/DocumentsScreenStyles";

const DocumentItem = ({
  docConfig,
  documentData,
  uploadedDoc,
  status,
  isUploading,
  onPickDocument,
  onUpload,
}) => {
  const hasDocument = documentData || uploadedDoc;

  const renderStatusText = () => {
    switch (status) {
      case "uploaded":
        return (
          <Text style={styles.uploadedText}>
            ✓ Uploaded {uploadedDoc.formattedDate}
          </Text>
        );
      case "selected":
        return (
          <Text style={styles.selectedText}>
            📎 Document selected{" "}
            {uploadedDoc ? "(will replace existing)" : ""}
          </Text>
        );
      case "uploading":
        return <Text style={styles.uploadingText}>⏳ Uploading...</Text>;
      case "failed":
        return (
          <Text style={styles.failedText}>❌ Upload failed - try again</Text>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        <Text style={styles.documentLabel}>
          {docConfig.label}
          {docConfig.required && <Text style={styles.required}></Text>}
        </Text>
        {renderStatusText()}
      </View>

      <View style={styles.documentActions}>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            hasDocument && styles.uploadButtonSelected,
          ]}
          onPress={onPickDocument}
          disabled={isUploading}
        >
          <Image
            source={require("../../../assets/upload-icon.png")}
            style={styles.uploadIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {documentData && (
          <TouchableOpacity
            style={[
              styles.submitSingleButton,
              isUploading && styles.submitSingleButtonDisabled,
            ]}
            onPress={onUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitSingleText}>
                {uploadedDoc ? "Replace" : "Upload"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default DocumentItem;