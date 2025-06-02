import { Alert } from "react-native";
import supabase from "../../../../config/supabaseClient";

// Function to generate sanitized folder name from user's full name
const generateFolderName = (fullName) => {
  if (!fullName) return "unknown_user";
  return fullName
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .toLowerCase(); // Convert to lowercase for consistency
};

// Function to upload signature to Supabase Storage
const uploadSignatureToSupabase = async (base64Signature, userFullName) => {
  try {
    if (!userFullName) {
      throw new Error("User full name is required for upload");
    }

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const fileName = `signature_${timestamp}.png`;

    // Create folder path using user's full name
    const folderName = generateFolderName(userFullName);
    const filePath = `${folderName}/${fileName}`;

    console.log("Uploading signature to path:", filePath);

    // Clean the base64 string and convert to Uint8Array
    const cleanBase64 = base64Signature.replace(
      /^data:image\/[a-z]+;base64,/,
      ""
    );
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Upload to Supabase storage with retry mechanism
    let uploadResult;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const { data, error } = await supabase.storage
          .from("documents-image")
          .upload(filePath, bytes, {
            contentType: "image/png",
            upsert: true,
          });

        if (error) throw error;

        uploadResult = data;
        break;
      } catch (uploadError) {
        attempts++;
        console.log(`Upload attempt ${attempts} failed:`, uploadError);

        if (attempts >= maxAttempts) {
          throw uploadError;
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("documents-image")
      .getPublicUrl(filePath);

    console.log("Signature uploaded successfully:", {
      path: uploadResult.path,
      publicUrl: publicUrlData.publicUrl,
    });

    return {
      path: uploadResult.path,
      publicUrl: publicUrlData.publicUrl,
      fileName: fileName,
    };
  } catch (error) {
    console.error("Error uploading signature:", error);

    // Better error handling
    if (
      error.message?.includes("network") ||
      error.message?.includes("fetch")
    ) {
      throw new Error(
        "Network connection error. Please check your internet connection and try again."
      );
    } else if (error.message?.includes("storage")) {
      throw new Error("Storage error. Please try again later.");
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
};

export const submitApplicationForm = async (formData, stallInfo) => {
  try {
    // Validate required fields
    const requiredFields = [
      "fullName",
      "age",
      "contactNo",
      "mailingAddress",
      "businessType",
      "capitalization",
    ];

    const missingFields = requiredFields.filter(
      (field) => !formData[field]?.trim()
    );

    if (missingFields.length > 0) {
      Alert.alert(
        "Missing Information",
        `Please fill in: ${missingFields.join(", ")}`
      );
      return { success: false, error: "Missing required fields" };
    }

    console.log("Starting Supabase submission...");
    console.log("Form Data:", formData);
    console.log("Stall Info:", stallInfo);

    // Test Supabase connection first
    console.log("Testing Supabase connection...");
    const { data: testData, error: testError } = await supabase
      .from("Application")
      .select("*")
      .limit(1);

    if (testError) {
      console.error("Connection test failed:", testError);
      Alert.alert(
        "Connection Error",
        `Cannot connect to database: ${JSON.stringify(testError)}`
      );
      return { success: false, error: testError };
    }

    console.log(
      "Connection test successful, existing records:",
      testData?.length || 0
    );

    // Handle signature upload if signature exists
    let signatureUrl = null;
    let signaturePath = null;
    let signatureFileName = null;

    if (formData.applicantSignature && formData.userFullName) {
      try {
        console.log("Uploading signature to Supabase Storage...");
        const uploadResult = await uploadSignatureToSupabase(
          formData.applicantSignature,
          formData.userFullName
        );
        
        signatureUrl = uploadResult.publicUrl;
        signaturePath = uploadResult.path;
        signatureFileName = uploadResult.fileName;
        
        console.log("Signature uploaded successfully:", uploadResult);
      } catch (uploadError) {
        console.error("Signature upload failed:", uploadError);
        Alert.alert(
          "Signature Upload Warning",
          "Failed to upload signature to storage, but application will continue. You can try uploading the signature again later."
        );
      }
    }

    // Prepare application data for Supabase
    const applicationData = {
      Applicants_Name: formData.fullName,
      Applicants_Age: parseInt(formData.age) || null,
      Applicants_ContactNo: parseInt(formData.contactNo) || null,
      Applicants_MailingAddress: formData.mailingAddress,
      Applicants_ProposeType: formData.businessType,
      Applicants_Capitalization: parseFloat(formData.capitalization) || null,
      status: "pending",
    };

    // Add optional fields only if they have values
    if (formData.highestEducation?.trim()) {
      applicationData.Applicants_HighestEducationalAttainment =
        formData.highestEducation;
    }
    if (formData.civilStatus?.trim()) {
      applicationData.Applicants_CivilStatus = formData.civilStatus;
    }
    if (formData.capitalSource?.trim()) {
      applicationData.Applicants_SourceOfCapital = formData.capitalSource;
    }
    if (formData.previousExperience?.trim()) {
      applicationData.Applicants_PreviousBusinessExperience =
        formData.previousExperience;
    }
    if (formData.relativeStallOwner?.trim()) {
      applicationData.Applicants_RelativeStallOwner =
        formData.relativeStallOwner;
    }
    
    // Add signature URL if upload was successful
    if (signatureUrl) {
      applicationData.Applicants_Signature = signatureUrl;
    }
    if (signaturePath) {
      applicationData.signature_path = signaturePath;
    }
    if (signatureFileName) {
      applicationData.signature_filename = signatureFileName;
    }
    
    if (formData.houseLocation?.trim()) {
      applicationData.Applicants_HouseLocation = formData.houseLocation;
    }
    if (stallInfo?.stallId || stallInfo?.id) {
      applicationData.stallNo = stallInfo.stallId || stallInfo.id;
    }

    console.log("Prepared application data:", applicationData);

    // Insert application data into Supabase
    console.log("Inserting application data...");
    const { data: applicationResult, error: applicationError } =
      await supabase.from("Application").insert([applicationData]).select();

    // Enhanced error logging
    if (applicationError) {
      console.error("Application insertion error details:");
      console.error("Error object:", applicationError);
      console.error("Error message:", applicationError.message);
      console.error("Error details:", applicationError.details);
      console.error("Error hint:", applicationError.hint);
      console.error("Error code:", applicationError.code);

      // More specific error messages
      let errorMessage = "Failed to submit application. ";
      if (applicationError.message) {
        errorMessage += applicationError.message;
      } else if (applicationError.details) {
        errorMessage += applicationError.details;
      } else if (applicationError.hint) {
        errorMessage += applicationError.hint;
      } else {
        errorMessage += "Unknown database error occurred.";
      }

      Alert.alert("Database Error", errorMessage);
      return { success: false, error: applicationError };
    }

    console.log("Application inserted successfully:", applicationResult);

    // Get the inserted application ID
    const applicationId = applicationResult[0]?.ApplicationId;

    if (!applicationId) {
      console.error("No application ID returned");
      Alert.alert(
        "Error",
        "Application was submitted but no ID was returned"
      );
      return { success: false, error: "No application ID returned" };
    }

    // Insert spouse information if provided
    if (formData.spouseName?.trim() && applicationId) {
      const spouseData = {
        spouse_FullName: formData.spouseName,
        ApplicationId: applicationId,
      };

      // Add optional spouse fields
      if (formData.spouseEducation?.trim()) {
        spouseData.spouse_EducationalAttainment = formData.spouseEducation;
      }
      if (formData.spouseOccupation?.trim()) {
        spouseData.spouse_Occupation = formData.spouseOccupation;
      }
      if (formData.spouseAge?.trim()) {
        spouseData.spouse_Age = parseInt(formData.spouseAge) || null;
      }
      if (formData.childrenNames?.trim()) {
        spouseData.namesOfChildren = formData.childrenNames;
      }

      console.log("Inserting spouse data...", spouseData);
      const { error: spouseError } = await supabase
        .from("SpouseInformation")
        .insert([spouseData]);

      if (spouseError) {
        console.error("Spouse insertion error:", spouseError);
        console.warn(
          "Spouse data could not be saved, but application was successful"
        );
      } else {
        console.log("Spouse data inserted successfully");
      }
    }

    return {
      success: true,
      applicationId: applicationId,
      signatureUploaded: !!signatureUrl,
      signatureUrl: signatureUrl,
    };
  } catch (error) {
    console.error("Supabase submission error:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    let errorMessage = "Failed to submit application. ";

    if (error.message?.includes("JSON")) {
      errorMessage += "Data format error. Please check your input.";
    } else if (
      error.message?.includes("permission") ||
      error.message?.includes("RLS")
    ) {
      errorMessage +=
        "Permission denied. Please check your database permissions.";
    } else if (
      error.message?.includes("network") ||
      error.message?.includes("fetch")
    ) {
      errorMessage += "Network error. Please check your internet connection.";
    } else if (
      error.message?.includes("relation") ||
      error.message?.includes("does not exist")
    ) {
      errorMessage +=
        "Database table not found. Please check your table name.";
    } else if (error.message) {
      errorMessage += error.message;
    } else {
      errorMessage += "Unknown error occurred.";
    }

    Alert.alert("Error", errorMessage);
    return { success: false, error: error };
  }
};