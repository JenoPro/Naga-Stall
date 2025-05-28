import { useState } from "react";
import supabase from "../../../config/supabaseClient";
import { documentTypes } from "./documentConfig";

export const useDocumentState = (userFullname) => {
  const [uploadingDocs, setUploadingDocs] = useState({});
  const [documents, setDocuments] = useState({
    awardPaper: null,
    leaseContract: null,
    mepoMarketClearance: null,
    barangayBusinessClearance: null,
    cedula: null,
    associationClearance: null,
    voterIdRegistration: null,
    healthCardYellowCard: null,
  });
  const [uploadedDocuments, setUploadedDocuments] = useState({});

  // Helper function to format date to MM/DD/YY
  const formatDateToMMDDYY = (dateString) => {
    try {
      const date = new Date(dateString);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      const year = date.getFullYear().toString().slice(-2);
      return `${month}/${day}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
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

  return {
    documents,
    setDocuments,
    uploadedDocuments,
    setUploadedDocuments,
    uploadingDocs,
    setUploadingDocs,
    loadUploadedDocuments,
    formatDateToMMDDYY,
  };
};