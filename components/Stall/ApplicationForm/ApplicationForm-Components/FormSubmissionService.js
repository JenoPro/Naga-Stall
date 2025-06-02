import { Alert } from "react-native";
import supabase from "../../../../config/supabaseClient";

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
    if (formData.applicantSignature?.trim()) {
      applicationData.Applicants_Signature = formData.applicantSignature;
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