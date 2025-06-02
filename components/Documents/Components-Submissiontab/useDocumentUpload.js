import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import supabase from "../../../config/supabaseClient";
import { documentTypes } from "./documentConfig";

export const useDocumentUpload = (userFullname) => {
  // Helper functions
  const sanitizeFolderName = (name) => {
    return name.replace(/[\/\\:*?"<>|]/g, "").trim();
  };

  const getFileExtension = (uri, mimeType = null) => {
    const uriMatch = uri.match(/\.([^.]+)$/);
    if (uriMatch) {
      return uriMatch[1].toLowerCase();
    }

    const mimeToExt = {
      "image/jpeg": "jpg",
      "image/jpg": "jpg",
      "image/png": "png",
      "image/pdf": "pdf",
      "application/pdf": "pdf",
    };

    return mimeToExt[mimeType] || "jpg";
  };

  const extractFilePathFromUrl = (url) => {
    try {
      const urlParts = url.split("/storage/v1/object/public/documents-image/");
      if (urlParts.length > 1) {
        return urlParts[1];
      }
      return null;
    } catch (error) {
      console.error("Error extracting file path from URL:", error);
      return null;
    }
  };

  const createFormData = async (documentData, filename) => {
    try {
      const formData = new FormData();

      const fileObj = {
        uri:
          Platform.OS === "ios"
            ? documentData.uri.replace("file://", "")
            : documentData.uri,
        type: documentData.mimeType || "image/jpeg",
        name: filename,
      };

      formData.append("file", fileObj);
      return formData;
    } catch (error) {
      console.error("Error creating form data:", error);
      throw error;
    }
  };

  // New function to convert base64 to blob
  const base64ToBlob = (base64Data) => {
    try {
      // Remove data URL prefix if present
      const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Convert base64 to binary
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: 'image/png' });
    } catch (error) {
      console.error('Error converting base64 to blob:', error);
      throw error;
    }
  };

  const testNetworkConnectivity = async () => {
    try {
      console.log("Testing network connectivity...");

      const netState = await NetInfo.fetch();
      console.log("Network state:", netState);

      if (!netState.isConnected || !netState.isInternetReachable) {
        throw new Error("No internet connection");
      }

      const { data, error } = await supabase
        .from("documents")
        .select("count")
        .limit(1);

      if (error) {
        console.log("Supabase test error:", error);
        throw new Error(`Supabase connection failed: ${error.message}`);
      }

      console.log("Network connectivity test passed");
      return { success: true };
    } catch (error) {
      console.error("Network connectivity test failed:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteOldDocument = async (documentType) => {
    try {
      // This would need access to uploadedDocuments state
      // For now, return success - you'll need to pass this data or refactor
      return { success: true };
    } catch (error) {
      console.error("Error in deleteOldDocument:", error);
      return { success: false, error: error.message };
    }
  };

  const uploadDocumentToSupabase = async (
    documentData,
    documentType,
    documentLabel
  ) => {
    try {
      console.log(`Starting upload for ${documentLabel}...`);

      if (!userFullname) {
        throw new Error("User full name not available");
      }

      const networkTest = await testNetworkConnectivity();
      if (!networkTest.success) {
        throw new Error(`Network issue: ${networkTest.error}`);
      }

      const maxSize = 8 * 1024 * 1024;
      if (documentData.fileSize && documentData.fileSize > maxSize) {
        throw new Error("File is too large. Please select a file under 8MB.");
      }

      const userFolderName = sanitizeFolderName(userFullname);
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .split(".")[0];
      const extension = getFileExtension(
        documentData.uri,
        documentData.mimeType
      );
      const filename = `${documentLabel.replace(
        /[\/\\:*?"<>|]/g,
        "_"
      )}_${timestamp}.${extension}`;
      const filePath = `${userFolderName}/${filename}`;

      console.log(`Uploading to path: ${filePath}`);

      try {
        let blob;
        
        // Handle base64 data (for signatures)
        if (documentData.isBase64) {
          console.log("Processing base64 data...");
          blob = documentData.blob || base64ToBlob(documentData.uri);
        } else {
          // Handle regular file URI
          console.log("Attempting upload with fetch method...");
          const response = await fetch(documentData.uri);
          if (!response.ok) {
            throw new Error(`Failed to read file: ${response.status}`);
          }
          blob = await response.blob();
        }

        console.log("Blob created, size:", blob.size);

        const { data: fileData, error: fileError } = await supabase.storage
          .from("documents-image")
          .upload(filePath, blob, {
            cacheControl: "3600",
            upsert: false,
            contentType: documentData.mimeType || "image/jpeg",
          });

        if (fileError) {
          console.error("Supabase upload error:", fileError);
          throw new Error(`Upload failed: ${fileError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from("documents-image")
          .getPublicUrl(filePath);

        console.log(`Upload successful for ${documentLabel}`);
        return {
          success: true,
          publicUrl: urlData.publicUrl,
          filename: filename,
          filePath: filePath,
        };
      } catch (blobError) {
        // Only try FormData method for non-base64 data
        if (!documentData.isBase64) {
          console.log("Blob method failed, trying FormData method:", blobError.message);

          const formData = await createFormData(documentData, filename);

          const { data: fileData, error: fileError } = await supabase.storage
            .from("documents-image")
            .upload(filePath, formData, {
              cacheControl: "3600",
              upsert: false,
            });

          if (fileError) {
            throw new Error(`Upload failed: ${fileError.message}`);
          }

          const { data: urlData } = supabase.storage
            .from("documents-image")
            .getPublicUrl(filePath);

          return {
            success: true,
            publicUrl: urlData.publicUrl,
            filename: filename,
            filePath: filePath,
          };
        } else {
          // For base64 data, re-throw the original error
          throw blobError;
        }
      }
    } catch (error) {
      console.error("Upload error details:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  const updateDocumentsTable = async (documentType, fileUrl) => {
    try {
      const docConfig = documentTypes.find((d) => d.key === documentType);
      if (!docConfig && documentType !== 'applicant_signature') {
        throw new Error("Invalid document type");
      }
      
      if (!userFullname) {
        throw new Error("User not found");
      }

      const { data: existingDoc } = await supabase
        .from("documents")
        .select("documentId")
        .eq("registrantFullName", userFullname)
        .single();

      const updateData = {};
      
      // Handle signature uploads separately
      if (documentType === 'applicant_signature') {
        updateData['applicant_signature'] = fileUrl;
        updateData['applicant_signature_uploaded_at'] = new Date().toISOString();
      } else {
        updateData[docConfig.column] = fileUrl;
        updateData[`${docConfig.column}_uploaded_at`] = new Date().toISOString();
      }

      let result;
      if (existingDoc) {
        result = await supabase
          .from("documents")
          .update(updateData)
          .eq("registrantFullName", userFullname)
          .select();
      } else {
        const insertData = {
          registrantFullName: userFullname,
          ...updateData,
        };
        result = await supabase.from("documents").insert([insertData]).select();
      }

      if (result.error) {
        throw new Error(`Database update failed: ${result.error.message}`);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    testNetworkConnectivity,
    uploadDocumentToSupabase,
    updateDocumentsTable,
    deleteOldDocument,
    sanitizeFolderName,
    getFileExtension,
    extractFilePathFromUrl,
    createFormData,
    base64ToBlob,
  };
};